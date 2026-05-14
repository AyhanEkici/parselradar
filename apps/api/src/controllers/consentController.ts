import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { requireAuthUser } from '../utils/authUser';
import ConsentRecord from '../models/ConsentRecord';
import PropertySubmission from '../models/PropertySubmission';

export const submitConsent = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const property = await PropertySubmission.findOne({ _id: req.params.propertyId, userId: user._id });
  if (!property) return res.status(404).json({ error: 'Mülk bulunamadı' });
  const { termsAccepted, privacyAccepted, ...rest } = req.body;
  if (!termsAccepted || !privacyAccepted) return res.status(400).json({ error: 'Açık rıza gerekli' });
  const consent = await ConsentRecord.findOneAndUpdate(
    { propertySubmissionId: property._id, userId: user._id },
    { termsAccepted, privacyAccepted, ...rest },
    { upsert: true, new: true }
  );
  res.json(consent);
};

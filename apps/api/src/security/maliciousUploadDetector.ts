export function maliciousUploadDetector(input: { filename: string; mimeType: string; byteSignature: string }) {
  const scriptLike = /\.(js|vbs|exe|bat|cmd|ps1)$/i.test(input.filename);
  const mismatched = /pdf/i.test(input.filename) && !/pdf/i.test(input.mimeType);
  const executableSignature = /^4d5a/i.test(input.byteSignature); // MZ header
  return {
    suspicious: scriptLike || mismatched || executableSignature,
    flags: [
      scriptLike ? 'script_extension' : null,
      mismatched ? 'mime_extension_mismatch' : null,
      executableSignature ? 'executable_signature' : null,
    ].filter(Boolean),
  };
}

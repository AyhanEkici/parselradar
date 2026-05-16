# MONGODB ATLAS SETUP

## 1. Cluster Creation
- Create a dedicated production cluster in MongoDB Atlas
- Choose a region close to your users

## 2. IP Allowlist
- Add backend server IPs to the IP Access List
- Remove 0.0.0.0/0 in production

## 3. Database Users
- Create a user with strong password
- Grant only required roles (readWrite, not admin)
- Never use the default admin user in production

## 4. Connection String
- Use the provided connection string in your .env file as MONGODB_URI
- Example: mongodb+srv://<user>:<password>@cluster0.mongodb.net/parselradar?retryWrites=true&w=majority

## 5. Backups
- Enable daily backups
- Test restore process

## 6. Security Recommendations
- Enable 2FA for all Atlas users
- Use IP access controls
- Monitor cluster activity
- Enable alerts for unusual activity

## 7. Monitoring
- Set up alerts for slow queries, high CPU, and connection spikes
- Review logs regularly

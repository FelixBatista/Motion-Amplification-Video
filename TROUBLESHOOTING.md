# Login Troubleshooting

## If login fails after creating an account:

### Option 1: Create a new account
The user schema was updated - if you created an account before the fix, try creating a new account with the updated schema.

### Option 2: Check the password
Make sure you're using the exact password you used during signup (case-sensitive).

### Option 3: Check server logs
Look at your backend server terminal for error messages. The login route now logs:
- "User not found" - if the email doesn't exist
- "Password comparison failed" - if the password doesn't match
- "Login successful" - if login works

## Common Issues:

1. **"Invalid Credentials" error**
   - Check if the email and password are correct
   - Make sure you're using the same email/password from signup
   - Check server logs for more details

2. **Cookie not being set**
   - Make sure cookies are enabled in your browser
   - Try a different browser or clear cookies
   - The cookie is set with `httpOnly: true` and `sameSite: 'lax'`

3. **Database connection issues**
   - Make sure MongoDB is connected (check server logs for "✓ MongoDB connection successful")
   - Verify your MongoDB connection string in `server/config.env`

## After fixes:
1. Restart your backend server
2. Try creating a NEW account (the schema was updated)
3. Try logging in with the new account


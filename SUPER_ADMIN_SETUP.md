# Super Admin Setup Guide

This guide explains how to set up the initial Super Admin user for the application.

## Creating the Initial Super Admin

To create the first Super Admin user, run the following command from the `server` directory:

```bash
npm run create:superadmin
```

## Customizing Super Admin Credentials

You can customize the Super Admin credentials by setting environment variables in your `.env` file:

```env
SUPER_ADMIN_EMAIL=admin@yourecommerce.com
SUPER_ADMIN_PASSWORD=YourSecurePassword123
SUPER_ADMIN_NAME=Super Administrator
```

If these environment variables are not set, the script will use default values:
- Email: `admin@example.com`
- Password: `Admin@123`
- Name: `Super Administrator`

## Security Recommendations

1. **Change the default password immediately** after creating the Super Admin account
2. **Use a strong, unique password** for production environments
3. **Store credentials securely** and never commit them to version control
4. **Limit Super Admin accounts** - only create as many as absolutely necessary

## Verifying Super Admin Creation

After running the script, you should see output similar to:

```
Connected to MongoDB
✅ Super Admin created successfully!
Email: admin@example.com
Password: Admin@123
Name: Super Administrator
```

If a Super Admin already exists, the script will inform you:

```
Connected to MongoDB
❌ Super Admin already exists:
Email: admin@example.com
Name: Super Administrator
```

## Role Assignment After Setup

Once you have your initial Super Admin:
1. Log in to the admin dashboard using the Super Admin credentials
2. Navigate to the "Permissions" tab (only visible to Super Admins)
3. Assign roles to other users as needed:
   - Super Admins can assign any role
   - Admins can only assign Guest, Customer, or Manager roles
   - Feature access is automatically controlled by role permissions

## Feature Access Control

Role-based feature access is automatically enforced:
- **Super Admin**: Full access to all features
- **Admin**: Manage users, products, and view reports
- **Manager**: Manage orders and customers
- **Customer**: Basic user actions
- **Guest**: Read-only public access

Feature tabs in the admin dashboard are only visible to users with appropriate permissions.
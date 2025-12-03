// Simple test to verify permissions system
import { hasPermission, hasAnyPermission, hasAllPermissions } from "./permissions";

// Test Super Admin permissions
console.log("Testing Super Admin permissions:");
console.log("manage_users:", hasPermission("superadmin", "manage_users")); // Should be true
console.log("manage_products:", hasPermission("superadmin", "manage_products")); // Should be true
console.log("reports:", hasPermission("superadmin", "reports")); // Should be true

// Test Admin permissions
console.log("\nTesting Admin permissions:");
console.log("manage_users:", hasPermission("admin", "manage_users")); // Should be true
console.log("manage_orders:", hasPermission("admin", "manage_orders")); // Should be false

// Test hasAnyPermission
console.log("\nTesting hasAnyPermission:");
console.log("Admin has any of [manage_users, manage_orders]:", hasAnyPermission("admin", ["manage_users", "manage_orders"])); // Should be true

// Test hasAllPermissions
console.log("\nTesting hasAllPermissions:");
console.log("Admin has all of [manage_users, manage_products, reports]:", hasAllPermissions("admin", ["manage_users", "manage_products", "reports"])); // Should be true
console.log("Admin has all of [manage_users, manage_orders]:", hasAllPermissions("admin", ["manage_users", "manage_orders"])); // Should be false

console.log("\nPermission system tests completed!");
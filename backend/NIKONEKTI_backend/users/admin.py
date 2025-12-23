from django.contrib import admin

# Register your models here.
# ============================================================================
# SECTION 1: IMPORTS
# ============================================================================
# Purpose: Import necessary Django admin modules and our custom User model

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User

"""
EXPLANATION - IMPORTS:

1. admin
   - Core Django admin module
   - Provides @admin.register() decorator
   - Base ModelAdmin class

2. UserAdmin as BaseUserAdmin
   - Django's built-in UserAdmin for auth.User
   - We rename it to "BaseUserAdmin" to avoid naming conflicts
   - We'll extend this class to customize it for our User model
   - Provides default admin functionality for user management

3. gettext_lazy as _
   - Internationalization (i18n) function
   - Marks strings for translation
   - "lazy" means translation happens when string is accessed, not when defined
   - Aliased as "_" for convenience: _('Text') instead of gettext_lazy('Text')

4. User
   - Our custom User model from models.py
   - The model we're creating admin interface for
"""


# ============================================================================
# SECTION 2: ADMIN REGISTRATION & CLASS DEFINITION
# ============================================================================

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom admin configuration for User model
    with phone_number as the primary identifier.
    
    EXPLANATION:
    
    @admin.register(User) DECORATOR:
    - Registers our User model with this admin class
    - Equivalent to: admin.site.register(User, UserAdmin)
    - Tells Django: "Use this UserAdmin class to manage User model in admin"
    
    INHERITANCE:
    - Extends BaseUserAdmin (Django's built-in UserAdmin)
    - Inherits user management features (password hashing, permissions, etc.)
    - We override specific attributes to customize for our phone-based auth
    
    WHY EXTEND BaseUserAdmin?
    - Gets built-in features: password change forms, permission management
    - Handles password hashing automatically
    - Provides secure user creation/editing
    - We just customize what's different (phone_number instead of username)
    """
    
    # ========================================================================
    # SECTION 3: LIST VIEW CONFIGURATION
    # ========================================================================
    
    ordering = ['-date_joined']
    """
    DEFAULT SORT ORDER for the user list page.
    
    EXPLANATION:
    - Controls how users appear in the admin list view
    - ['-date_joined']: Sort by date_joined in DESCENDING order
    - Minus sign (-) = descending (newest first)
    - Without minus = ascending (oldest first)
    
    RESULT:
    - Most recently registered users appear at the top
    - Useful for monitoring new signups
    
    ALTERNATIVE OPTIONS:
    - ['full_name']: Sort alphabetically by name
    - ['-last_login']: Show most recently active users first
    - ['role', 'full_name']: Sort by role, then by name within each role
    """
    
    list_display = (
        'phone_number',
        'full_name',
        'role',
        'is_verified',
        'kyc_status',
        'is_staff',
        'is_active',
    )
    """
    COLUMNS DISPLAYED in the user list table.
    
    EXPLANATION:
    - Each item is a field name or method from the User model
    - These become columns in the admin list view
    - Order matters: displayed left to right as listed
    
    COLUMNS EXPLAINED:
    1. phone_number: Primary identifier (replaces username)
    2. full_name: User's name for quick identification
    3. role: TENANT/LANDLORD/AGENT badge
    4. is_verified: ✓/✗ icon showing verification status
    5. kyc_status: Current KYC stage (color-coded)
    6. is_staff: Can access admin (✓/✗)
    7. is_active: Account active status (✓/✗)
    
    WHY THESE FIELDS?
    - Quick overview of user status at a glance
    - Most important info for admin management
    - Can click on phone_number to edit user
    
    FEATURES:
    - Clickable rows (opens detail page)
    - Sortable columns (click column header)
    - Boolean fields show as green ✓ or red ✗ icons
    """
    
    list_filter = (
        'role',
        'is_verified',
        'kyc_status',
        'is_staff',
        'is_active',
    )
    """
    SIDEBAR FILTERS for the user list page.
    
    EXPLANATION:
    - Creates a filter sidebar on the right side of list view
    - Each item becomes a collapsible filter section
    - Allows quick filtering of users by these criteria
    
    FILTERS EXPLAINED:
    1. role: Filter by TENANT/LANDLORD/AGENT
       - Shows count for each role
       - Click to show only that role
    
    2. is_verified: Filter by verification status
       - Yes: Verified users only
       - No: Unverified users only
       - All: Show all users
    
    3. kyc_status: Filter by KYC stage
       - NOT_SUBMITTED
       - PENDING
       - APPROVED
       - REJECTED
       - RESUBMISSION_REQUIRED
    
    4. is_staff: Filter admin users
       - Useful for managing admin permissions
    
    5. is_active: Filter active/inactive accounts
       - Find disabled accounts quickly
    
    USE CASES:
    - "Show me all unverified landlords"
    - "Find all pending KYC submissions"
    - "List all inactive accounts"
    
    FILTERS ARE CUMULATIVE:
    - Select multiple filters (e.g., LANDLORD + PENDING KYC)
    - Results match ALL selected filters (AND logic)
    """
    
    search_fields = ('phone_number', 'full_name')
    """
    SEARCHABLE FIELDS in the admin list.
    
    EXPLANATION:
    - Adds a search box at the top of the user list
    - Searches across specified fields
    - Case-insensitive partial matching
    
    HOW IT WORKS:
    - Type in search box: "+255712" or "John"
    - Django searches both phone_number AND full_name
    - Returns users where ANY field matches (OR logic)
    - Uses SQL LIKE query: WHERE phone_number LIKE '%255712%' OR full_name LIKE '%John%'
    
    SEARCH EXAMPLES:
    - "+255712" → Finds all numbers starting with +255712
    - "john" → Finds "John Doe", "Johnny Smith", etc.
    - "doe" → Finds "John Doe", "Jane Doe", etc.
    
    WHY THESE FIELDS?
    - phone_number: Primary search (users often search by phone)
    - full_name: Find users by name
    - email NOT included (it's optional and might be null)
    
    PERFORMANCE NOTE:
    - Searching is fast because we have database indexes on these fields
    - See models.py Section 3H for index definitions
    """
    
    # ========================================================================
    # SECTION 4: DETAIL VIEW CONFIGURATION (EDIT EXISTING USER)
    # ========================================================================
    
    fieldsets = (
        (None, {'fields': ('phone_number', 'password')}),
        (_('Personal Information'), {'fields': ('full_name', 'email', 'profile_picture')}),
        (_('Role & Verification'), {'fields': ('role', 'is_verified', 'kyc_status')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important Dates'), {'fields': ('last_login', 'date_joined')}),
    )
    """
    FORM LAYOUT when EDITING an existing user.
    
    STRUCTURE:
    fieldsets = (
        (SECTION_TITLE, {'fields': (FIELD_TUPLE)}),
        (SECTION_TITLE, {'fields': (FIELD_TUPLE)}),
        ...
    )
    
    EXPLANATION:
    - Organizes edit form into logical sections
    - Each section has a title and list of fields
    - Makes complex forms easier to navigate
    - None = section without title (authentication fields)
    
    SECTIONS BREAKDOWN:
    
    1. AUTHENTICATION SECTION (No Title):
       Fields: phone_number, password
       - Core login credentials
       - No title keeps them prominent at top
       - Password shows as "***" with change link
    
    2. PERSONAL INFORMATION:
       Fields: full_name, email, profile_picture
       - User identity data
       - profile_picture shows current image + upload widget
       - email is optional (can be blank)
    
    3. ROLE & VERIFICATION:
       Fields: role, is_verified, kyc_status
       - Business logic fields
       - Dropdown for role (TENANT/LANDLORD/AGENT)
       - Checkbox for is_verified
       - Dropdown for kyc_status (all statuses)
       - Admin can manually update verification
    
    4. PERMISSIONS:
       Fields: is_active, is_staff, is_superuser, groups, user_permissions
       - Access control settings
       - is_active: Enable/disable account
       - is_staff: Grant admin access
       - is_superuser: Grant all permissions
       - groups: Assign user to permission groups
       - user_permissions: Granular permission control
    
    5. IMPORTANT DATES:
       Fields: last_login, date_joined
       - Audit trail timestamps
       - Read-only (see readonly_fields below)
       - Shows when user registered and last logged in
    
    WHY THIS STRUCTURE?
    - Logical grouping improves UX
    - Critical fields (auth) at top
    - Related fields together
    - Dangerous fields (permissions) clearly separated
    
    ADDITIONAL OPTIONS:
    - Can add 'classes': ('collapse',) to collapse sections by default
    - Can add 'description': 'Help text' for section-level help
    """
    
    # ========================================================================
    # SECTION 5: ADD NEW USER CONFIGURATION
    # ========================================================================
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone_number', 'full_name', 'password1', 'password2', 'role'),
        }),
    )
    """
    FORM LAYOUT when ADDING a new user (different from edit form).
    
    EXPLANATION:
    - Separate fieldset for creating new users
    - Simpler than edit form (only essential fields)
    - Django shows this instead of 'fieldsets' on add page
    
    WHY SEPARATE add_fieldsets?
    - Creating users needs different fields than editing
    - Can't edit date_joined (auto-set on creation)
    - Can't edit last_login (user hasn't logged in yet)
    - Focuses on required fields only
    
    FIELDS EXPLAINED:
    
    1. phone_number:
       - Required unique identifier
       - Validated against Tanzania format
       - Used for login
    
    2. full_name:
       - Required by REQUIRED_FIELDS in model
       - User's legal name
    
    3. password1:
       - New password field
       - Shows password strength indicator
       - Django's built-in widget
    
    4. password2:
       - Password confirmation field
       - Must match password1
       - Prevents typos
       - Django validates they match
    
    5. role:
       - Dropdown: TENANT/LANDLORD/AGENT
       - Defaults to TENANT
       - Can be changed later
    
    WHAT'S MISSING (intentionally):
    - is_verified: Defaults to False (set after KYC)
    - kyc_status: Defaults to NOT_SUBMITTED
    - is_staff: Defaults to False (manually grant later)
    - email: Optional, can add after creation
    - Timestamps: Auto-generated
    
    CSS CLASSES:
    - 'wide': Makes form fields wider (better UX for phone numbers)
    
    AFTER CREATION:
    - User is created with hashed password
    - Can login with phone_number + password
    - Admin can edit full profile to add more details
    """
    
    # ========================================================================
    # SECTION 6: READ-ONLY FIELDS
    # ========================================================================
    
    readonly_fields = ('date_joined', 'last_login')
    """
    FIELDS THAT CANNOT BE EDITED in the admin form.
    
    EXPLANATION:
    - Fields appear in edit form but are grayed out
    - Admin can see values but cannot change them
    - Prevents accidental modification of critical data
    
    WHY THESE FIELDS ARE READ-ONLY:
    
    1. date_joined:
       - Auto-set when user is created (auto_now_add=True)
       - Historical record of registration date
       - Should never be manually changed
       - Important for analytics and audit trails
    
    2. last_login:
       - Auto-updated by Django auth system
       - Tracks user activity
       - Manual changes would corrupt activity data
       - Used for security monitoring
    
    WHY NOT EDITABLE:
    - Maintains data integrity
    - Prevents backdating accounts
    - Ensures accurate audit trails
    - Security compliance (tamper-proof timestamps)
    
    FIELDS NOT IN readonly_fields (Why they're editable):
    - phone_number: Admin might need to fix typos
    - role: Users might request role changes
    - is_verified: Admin manually verifies KYC
    - kyc_status: Admin updates after document review
    
    DISPLAY:
    - Shows actual timestamps in human-readable format
    - Example: "Dec. 20, 2024, 2:30 p.m."
    - Grayed out with lock icon
    """
    
    # ========================================================================
    # SECTION 7: MANY-TO-MANY WIDGET
    # ========================================================================
    
    filter_horizontal = ('groups', 'user_permissions')
    """
    HORIZONTAL FILTER WIDGET for many-to-many relationships.
    
    EXPLANATION:
    - Special UI widget for selecting multiple items
    - Two boxes side-by-side: "Available" and "Chosen"
    - Move items between boxes with arrow buttons
    - Much better UX than default multi-select dropdown
    
    HOW IT WORKS:
    
    [Available Groups]  ←→  [Chosen Groups]
    - Admin Staff           - Content Editors
    - Moderators           
    - Premium Users
    
    - Double-click or use arrows to move items
    - Search boxes for filtering long lists
    - Select multiple with Ctrl/Cmd + Click
    
    FIELDS EXPLAINED:
    
    1. groups:
       - Django's built-in group-based permissions
       - Groups like "Property Managers", "Verified Landlords"
       - User inherits all permissions from assigned groups
       - Example: "KYC Approvers" group can approve KYC
    
    2. user_permissions:
       - Individual permissions (more granular)
       - Like "Can add property", "Can delete review"
       - Use when user needs specific permission not in any group
       - Typically use groups instead for easier management
    
    WHY filter_horizontal?
    - Better UX than default dropdown
    - Easy to see what's selected
    - Search functionality for many items
    - Clear visual of current assignments
    
    ALTERNATIVE:
    - filter_vertical: Same widget but stacked vertically
    - Use vertical for shorter lists
    - Use horizontal for long permission lists (our case)
    
    PERMISSION SYSTEM FLOW:
    1. Create groups (e.g., "Property Managers")
    2. Assign permissions to groups
    3. Assign users to groups
    4. User gets all group permissions
    5. Can add extra individual permissions if needed
    """


# ============================================================================
# SECTION 8: HOW TO IMPLEMENT IN YOUR DJANGO PROJECT
# ============================================================================

"""
IMPLEMENTATION GUIDE:

STEP 1: FILE STRUCTURE
Your Django app should have this structure:

user/
├── __init__.py
├── models.py          ← Your User model (already created)
├── admin.py           ← THIS FILE (place code here)
├── apps.py
├── migrations/
│   └── __init__.py
└── tests.py

STEP 2: SAVE THIS FILE
- Copy all code above
- Save as: user/admin.py
- Ensure proper indentation (Python is indentation-sensitive)

STEP 3: VERIFY SETTINGS.PY
Ensure your settings.py has:

INSTALLED_APPS = [
    'django.contrib.admin',      # ← Must be included
    'django.contrib.auth',       # ← Must be included
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'user',                      # ← Your app must be registered
]

AUTH_USER_MODEL = 'user.User'   # ← Critical! Points to custom User

STEP 4: CREATE MIGRATIONS
$ python manage.py makemigrations
$ python manage.py migrate

STEP 5: CREATE SUPERUSER
$ python manage.py createsuperuser
Phone number: +255712345678
Full name: Admin User
Password: ********
Password (again): ********
Superuser created successfully.

STEP 6: START SERVER & ACCESS ADMIN
$ python manage.py runserver

Visit: http://127.0.0.1:8000/admin/
Login with phone number + password

STEP 7: WHAT YOU'LL SEE
After login, you'll see:

Django Administration
├── AUTHENTICATION AND AUTHORIZATION
│   └── Users  ← Your custom User model
│       ├── Add user
│       └── User list (with our custom columns)
│
└── Groups (if you want to use permission groups)

STEP 8: TEST THE FEATURES

1. LIST VIEW:
   - See all users in table format
   - Use search box (try phone number or name)
   - Use filters (role, verification status)
   - Click column headers to sort

2. ADD USER:
   - Click "Add user" button
   - Fill in phone number (Tanzania format)
   - Enter name, password, role
   - Save and continue editing to add more details

3. EDIT USER:
   - Click on any phone number
   - See organized sections (authentication, personal info, etc.)
   - Update role, verify KYC, change permissions
   - Notice date fields are read-only

4. MANAGE PERMISSIONS:
   - Scroll to "Permissions" section
   - Use filter_horizontal widget for groups
   - Make user staff to grant admin access
   - Set is_active to False to disable account

5. BULK ACTIONS:
   - Select multiple users with checkboxes
   - Use "Action" dropdown (e.g., "Delete selected users")
   - Careful with bulk delete!

TROUBLESHOOTING:

ERROR: "User model not found"
→ Check AUTH_USER_MODEL in settings.py

ERROR: "No module named 'user'"
→ Ensure 'user' is in INSTALLED_APPS

ERROR: "Phone number validation failed"
→ Use correct format: +255712345678

ERROR: "Admin not loading"
→ Check for Python syntax errors in admin.py
→ Restart server after code changes

ADVANCED CUSTOMIZATION:

Want to add more features?

1. ADD ACTIONS:
@admin.action(description='Approve selected KYC')
def approve_kyc(modeladmin, request, queryset):
    queryset.update(kyc_status='APPROVED', is_verified=True)

class UserAdmin(BaseUserAdmin):
    actions = [approve_kyc]

2. ADD CUSTOM COLUMNS:
def verified_badge(self, obj):
    if obj.is_verified:
        return '✅ Verified'
    return '❌ Not Verified'
verified_badge.short_description = 'Status'

list_display = (..., 'verified_badge')

3. ADD INLINE EDITING:
list_editable = ('role', 'is_active')  # Edit directly in list view

4. CUSTOMIZE LIST PER PAGE:
list_per_page = 50  # Show 50 users per page

SECURITY BEST PRACTICES:

1. Never share superuser credentials
2. Use is_staff (not is_superuser) for most admins
3. Create groups with limited permissions
4. Regularly audit admin actions in Django's log
5. Use Django's built-in admin log:
   - Admin > Log entries (shows all admin actions)

PRODUCTION CONSIDERATIONS:

1. Use environment variables for sensitive settings
2. Enable HTTPS for admin access
3. Consider django-admin-honeypot for security
4. Add two-factor authentication (django-otp)
5. Limit admin access by IP (ALLOWED_HOSTS)
6. Regular backups before bulk operations
"""
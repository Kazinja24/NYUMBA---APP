# ============================================================================
# SECTION 1: IMPORTS
# ============================================================================
# Purpose: Import necessary Django modules for custom user authentication

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _

"""
EXPLANATION - IMPORTS:
- models: Django's ORM for database operations
- AbstractBaseUser: Base class for custom user models (handles password hashing)
- PermissionsMixin: Adds permission and group functionality
- BaseUserManager: Base class for creating custom user manager
- RegexValidator: Validates fields using regular expressions
- gettext_lazy: Enables internationalization (translation support)
"""


# ============================================================================
# SECTION 2: CUSTOM USER MANAGER
# ============================================================================
# Purpose: Handle user creation with phone_number instead of username

class UserManager(BaseUserManager):
    """
    Custom user manager where phone_number is the unique identifier
    for authentication instead of username.
    
    EXPLANATION:
    Django's default UserManager uses 'username' for authentication.
    We override this to use 'phone_number' as the primary identifier,
    which is more suitable for Tanzania where phone numbers are unique.
    """
    
    def create_user(self, phone_number, full_name, password=None, **extra_fields):
        """
        Create and save a regular user with the given phone number and password.
        
        PARAMETERS:
        - phone_number: Tanzania format (+255XXXXXXXXX)
        - full_name: User's full legal name
        - password: User's password (will be hashed)
        - **extra_fields: Additional fields like role, email, etc.
        
        PROCESS:
        1. Validate required fields
        2. Create user instance with provided data
        3. Hash the password using set_password()
        4. Save to database
        """
        if not phone_number:
            raise ValueError(_('The phone number must be set'))
        if not full_name:
            raise ValueError(_('The full name must be set'))
        
        user = self.model(
            phone_number=phone_number,
            full_name=full_name,
            **extra_fields
        )
        user.set_password(password)  # Automatically hashes the password
        user.save(using=self._db)
        return user
    
    def create_superuser(self, phone_number, full_name, password=None, **extra_fields):
        """
        Create and save a superuser with admin privileges.
        
        EXPLANATION:
        Superusers have all permissions and can access Django admin.
        This method ensures required flags are set to True.
        
        REQUIRED FLAGS:
        - is_staff: Can access admin site
        - is_superuser: Has all permissions
        - is_active: Account is active
        - is_verified: KYC is verified
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_verified', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        
        return self.create_user(phone_number, full_name, password, **extra_fields)


# ============================================================================
# SECTION 3: USER MODEL - CLASS DEFINITION
# ============================================================================

class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model for Tanzania-based rental platform.
    Uses phone_number as the unique identifier instead of username.
    
    INHERITANCE:
    - AbstractBaseUser: Provides core authentication functionality
    - PermissionsMixin: Adds permission/group management fields and methods
    """
    
    # ========================================================================
    # SECTION 3A: CHOICE FIELDS (ENUMS)
    # ========================================================================
    
    class Role(models.TextChoices):
        """
        User roles in the rental platform.
        
        EXPLANATION:
        TextChoices creates a validated enum-like structure.
        Format: CONSTANT = 'db_value', 'Human Readable Label'
        
        ROLES:
        - TENANT: Users looking to rent properties
        - LANDLORD: Property owners who rent out properties
        - AGENT: Real estate agents who manage properties
        """
        TENANT = 'TENANT', _('Tenant')
        LANDLORD = 'LANDLORD', _('Landlord')
        AGENT = 'AGENT', _('Agent')
    
    class KYCStatus(models.TextChoices):
        """
        KYC (Know Your Customer) verification stages.
        
        EXPLANATION:
        Tracks the document verification process for trust/security.
        
        STATUSES:
        - NOT_SUBMITTED: User hasn't uploaded KYC documents
        - PENDING: Documents uploaded, awaiting admin review
        - APPROVED: Documents verified and approved
        - REJECTED: Documents rejected (invalid/fake)
        - RESUBMISSION_REQUIRED: User needs to upload new documents
        """
        NOT_SUBMITTED = 'NOT_SUBMITTED', _('Not Submitted')
        PENDING = 'PENDING', _('Pending Review')
        APPROVED = 'APPROVED', _('Approved')
        REJECTED = 'REJECTED', _('Rejected')
        RESUBMISSION_REQUIRED = 'RESUBMISSION_REQUIRED', _('Resubmission Required')
    
    # ========================================================================
    # SECTION 3B: PHONE NUMBER VALIDATOR
    # ========================================================================
    
    phone_regex = RegexValidator(
        regex=r'^\+255[67]\d{8}$',
        message="Phone number must be in the format: '+255XXXXXXXXX'. Tanzania format required."
    )
    """
    REGEX BREAKDOWN: ^\+255[67]\d{8}$
    - ^        : Start of string
    - \+255    : Literal "+255" (Tanzania country code)
    - [67]     : Must be 6 or 7 (Vodacom, Airtel, Tigo, etc.)
    - \d{8}    : Exactly 8 digits (0-9)
    - $        : End of string
    
    VALID EXAMPLES:
    - +255712345678 (Vodacom/Airtel)
    - +255622334455 (Tigo)
    
    INVALID EXAMPLES:
    - 255712345678 (missing +)
    - +255812345678 (wrong second digit)
    - +2557123456 (too short)
    """
    
    # ========================================================================
    # SECTION 3C: PRIMARY FIELDS (CORE USER DATA)
    # ========================================================================
    
    phone_number = models.CharField(
        _('phone number'),
        validators=[phone_regex],
        max_length=13,  # +255 (4) + 9 digits = 13 characters
        unique=True,    # No two users can have the same phone number
        help_text=_('Required. Tanzania phone number format: +255XXXXXXXXX')
    )
    """
    PRIMARY IDENTIFIER: Replaces username in default Django auth.
    - Used for login
    - Must be unique
    - Validated against Tanzania format
    """
    
    full_name = models.CharField(
        _('full name'),
        max_length=150,
        help_text=_('Full legal name of the user')
    )
    """
    STORES: User's complete legal name (as on ID documents).
    Used for KYC verification and legal contracts.
    """
    
    role = models.CharField(
        _('role'),
        max_length=10,
        choices=Role.choices,
        default=Role.TENANT,
        help_text=_('User role in the platform')
    )
    """
    DETERMINES: User permissions and available features.
    - TENANT: Can search and rent properties
    - LANDLORD: Can post and manage properties
    - AGENT: Can manage multiple properties for others
    """
    
    # ========================================================================
    # SECTION 3D: VERIFICATION FIELDS (KYC/TRUST)
    # ========================================================================
    
    is_verified = models.BooleanField(
        _('verified status'),
        default=False,
        help_text=_('Designates whether this user has completed KYC verification.')
    )
    """
    BOOLEAN FLAG: Quick check if user is verified.
    - False: Not verified (limited access)
    - True: Verified (full platform access)
    
    Used for trust badges and permission checks.
    """
    
    kyc_status = models.CharField(
        _('KYC status'),
        max_length=25,
        choices=KYCStatus.choices,
        default=KYCStatus.NOT_SUBMITTED,
        help_text=_('Current KYC document verification stage')
    )
    """
    DETAILED STATUS: Tracks where user is in verification process.
    More granular than is_verified boolean.
    
    WORKFLOW:
    NOT_SUBMITTED → PENDING → APPROVED (is_verified=True)
                           → REJECTED → RESUBMISSION_REQUIRED
    """
    
    # ========================================================================
    # SECTION 3E: ADDITIONAL FIELDS (OPTIONAL DATA)
    # ========================================================================
    
    email = models.EmailField(
        _('email address'),
        blank=True,      # Not required in forms
        null=True,       # Can be NULL in database
        help_text=_('Optional email address')
    )
    """
    OPTIONAL: Email for notifications and password recovery.
    Not required since phone_number is primary identifier.
    """
    
    profile_picture = models.ImageField(
        _('profile picture'),
        upload_to='profile_pictures/',  # Files saved to MEDIA_ROOT/profile_pictures/
        blank=True,
        null=True
    )
    """
    STORES: User's profile photo.
    - Uploaded to media/profile_pictures/
    - Optional field
    - Requires Pillow library: pip install Pillow
    """
    
    # ========================================================================
    # SECTION 3F: PERMISSION FIELDS (ACCESS CONTROL)
    # ========================================================================
    
    is_staff = models.BooleanField(
        _('staff status'),
        default=False,
        help_text=_('Designates whether the user can log into the admin site.')
    )
    """
    ADMIN ACCESS: Controls Django admin panel access.
    - True: Can access admin site
    - False: Cannot access admin site
    
    Set automatically for superusers.
    """
    
    is_active = models.BooleanField(
        _('active'),
        default=True,
        help_text=_('Designates whether this user should be treated as active.')
    )
    """
    ACCOUNT STATUS: Soft delete functionality.
    - True: Account active (can login)
    - False: Account disabled (cannot login)
    
    Better than deleting users (preserves data/history).
    """
    
    # ========================================================================
    # SECTION 3G: TIMESTAMP FIELDS (AUDIT TRAIL)
    # ========================================================================
    
    date_joined = models.DateTimeField(_('date joined'), auto_now_add=True)
    """
    REGISTRATION DATE: Set once when user is created.
    - auto_now_add=True: Automatically set on creation
    - Never changes after initial creation
    """
    
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    """
    LAST UPDATE: Automatically updated on every save.
    - auto_now=True: Updates on every model save()
    - Tracks when user data was last modified
    """
    
    last_login = models.DateTimeField(_('last login'), blank=True, null=True)
    """
    LAST LOGIN TIME: Tracks user activity.
    - Updated by Django's authentication system
    - Can be null (user never logged in)
    """
    
    # ========================================================================
    # SECTION 3H: MODEL CONFIGURATION
    # ========================================================================
    
    objects = UserManager()
    """
    MANAGER ASSIGNMENT: Links our custom UserManager to this model.
    Enables: User.objects.create_user() and User.objects.create_superuser()
    """
    
    USERNAME_FIELD = 'phone_number'
    """
    AUTHENTICATION FIELD: Tells Django to use phone_number for login.
    Default is 'username', but we override it.
    
    IMPACT:
    - Login forms will ask for phone_number instead of username
    - authenticate(phone_number='+255...', password='...')
    """
    
    REQUIRED_FIELDS = ['full_name']
    """
    ADDITIONAL REQUIRED FIELDS: Used by createsuperuser command.
    When creating superuser via CLI, Django will prompt for:
    1. phone_number (USERNAME_FIELD - automatically required)
    2. full_name (from REQUIRED_FIELDS)
    3. password (always required)
    """
    
    class Meta:
        """
        MODEL METADATA: Configuration for database and Django admin.
        """
        verbose_name = _('user')
        verbose_name_plural = _('users')
        """
        ADMIN DISPLAY: How model appears in Django admin.
        - Singular: "user"
        - Plural: "users"
        """
        
        db_table = 'users'
        """
        DATABASE TABLE NAME: Explicitly set table name.
        Without this, Django would use: 'user_user' (app_model)
        """
        
        ordering = ['-date_joined']
        """
        DEFAULT ORDERING: How queries return results.
        - Minus (-) means descending order
        - Newest users appear first
        """
        
        indexes = [
            models.Index(fields=['phone_number']),
            models.Index(fields=['role']),
            models.Index(fields=['kyc_status']),
        ]
        """
        DATABASE INDEXES: Speed up queries on these fields.
        
        WHY THESE FIELDS:
        - phone_number: Used in login (frequent lookups)
        - role: Filtering by user type (landlords, tenants)
        - kyc_status: Admin filtering verified users
        
        BENEFIT: Faster queries, especially with large datasets.
        """
    
    # ========================================================================
    # SECTION 3I: STRING REPRESENTATION
    # ========================================================================
    
    def __str__(self):
        """
        STRING REPRESENTATION: How user appears in admin and shell.
        
        RETURNS: "John Doe (+255712345678)"
        
        USED IN:
        - Django admin list view
        - Shell: print(user)
        - Logs and error messages
        """
        return f"{self.full_name} ({self.phone_number})"
    
    def get_full_name(self):
        """
        FULL NAME METHOD: Required by Django auth system.
        
        RETURNS: Complete name of user
        USAGE: Email templates, admin interface
        """
        return self.full_name
    
    def get_short_name(self):
        """
        SHORT NAME METHOD: Required by Django auth system.
        
        RETURNS: First name only
        EXAMPLE: "John Doe" → "John"
        USAGE: Greetings like "Hi John!"
        """
        return self.full_name.split()[0] if self.full_name else ''
    
    # ========================================================================
    # SECTION 3J: PROPERTY METHODS (COMPUTED FIELDS)
    # ========================================================================
    
    @property
    def is_tenant(self):
        """
        CHECK USER ROLE: Is this user a tenant?
        
        USAGE: if user.is_tenant: ...
        BENEFIT: More readable than: user.role == User.Role.TENANT
        """
        return self.role == self.Role.TENANT
    
    @property
    def is_landlord(self):
        """
        CHECK USER ROLE: Is this user a landlord?
        
        USAGE: if user.is_landlord: ...
        """
        return self.role == self.Role.LANDLORD
    
    @property
    def is_agent(self):
        """
        CHECK USER ROLE: Is this user an agent?
        
        USAGE: if user.is_agent: ...
        """
        return self.role == self.Role.AGENT
    
    @property
    def kyc_approved(self):
        """
        COMBINED CHECK: Is KYC fully approved?
        
        CHECKS:
        1. kyc_status is APPROVED
        2. is_verified flag is True
        
        Both must be true for full verification.
        """
        return self.kyc_status == self.KYCStatus.APPROVED and self.is_verified
    
    # ========================================================================
    # SECTION 3K: BUSINESS LOGIC METHODS
    # ========================================================================
    
    def can_post_properties(self):
        """
        PERMISSION CHECK: Can this user post properties?
        
        REQUIREMENTS:
        1. Must be LANDLORD or AGENT (not TENANT)
        2. Must have approved KYC
        
        USAGE:
        if user.can_post_properties():
            # Show "Add Property" button
        else:
            # Show "Complete KYC" message
        
        PREVENTS: Unverified users from posting fake properties
        """
        return (self.is_landlord or self.is_agent) and self.kyc_approved


# ============================================================================
# END OF FILE
# ============================================================================

"""
USAGE EXAMPLES:

1. CREATE A TENANT:
user = User.objects.create_user(
    phone_number='+255712345678',
    full_name='John Doe',
    password='securepassword123',
    role=User.Role.TENANT
)

2. AUTHENTICATE USER:
from django.contrib.auth import authenticate
user = authenticate(phone_number='+255712345678', password='securepassword123')

3. CHECK PERMISSIONS:
if user.can_post_properties():
    # Allow property posting
else:
    # Redirect to KYC page

4. QUERY USERS:
verified_landlords = User.objects.filter(
    role=User.Role.LANDLORD,
    is_verified=True
)

5. UPDATE KYC STATUS:
user.kyc_status = User.KYCStatus.APPROVED
user.is_verified = True
user.save()
"""
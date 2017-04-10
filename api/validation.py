
from django.core.exceptions import ValidationError
from django.core.validators import *

# NB: If these constants are updated, remember to update the JavaScript versions (in src/common/validation.js)!!
USERNAME_MIN_LENGTH = 1
USERNAME_MAX_LENGTH = 16
USERNAME_REGEX = r'/^[a-zA-Z0-9-_]*$/g'
PASSWORD_MIN_LENGTH = 6
PASSWORD_MAX_LENGTH = 24
EMAIL_MIN_LENGTH = 4
EMAIL_MAX_LENGTH = 24

USERNAME_VALIDATORS = [MinLengthValidator(USERNAME_MIN_LENGTH), MaxLengthValidator(USERNAME_MAX_LENGTH), RegexValidator(regex=USERNAME_REGEX)]
PASSWORD_VALIDATORS = [MinLengthValidator(PASSWORD_MIN_LENGTH), MaxLengthValidator(PASSWORD_MAX_LENGTH)]
EMAIL_VALIDATORS = [MinLengthValidator(EMAIL_MIN_LENGTH), MaxLengthValidator(EMAIL_MAX_LENGTH), EmailValidator()]

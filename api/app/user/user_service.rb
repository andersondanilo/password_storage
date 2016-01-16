require 'singleton'
require 'active_model'
require 'password_strength'

module PasswordStorage
  module User

    class UserService
      include Singleton

      def make_validator(user)
        validator = UserValidator.new
        validator.name = user.name
        validator.email = user.email
        validator.password = user.password

        validator
      end

      def make_update_information_validator(old_user, attributes)
        validator = UpdateInformationValidator.new
        validator.name = attributes[:name]
        validator.old_user = old_user
        validator.email = old_user.email
        validator.name = attributes[:name]
        validator.old_password = attributes[:old_password]
        validator.new_password = attributes[:new_password]

        validator
      end

      def register(user)
        user.crypt_salt = SecureRandom.base64(32)
        user_repository.save user
      end

      class UserValidator
        include ActiveModel::Validations
        include ActiveModel::Validations::Callbacks

        attr_accessor :name,
                      :email,
                      :password,
                      :password_hash

        validates_presence_of :name,
          message: 'The field name is required'

        validates_presence_of :password,
          message: 'The field password is required'

        validates_presence_of :email,
          message: 'The field email is required'

        validates_length_of :password, minimum: 8,
          message: 'Your password must be at least 8 characters'

        validates_strength_of :password, :with => :email, :level => :good,
          message: 'Your password should include capital letters, lowercase and numbers'

        validate do
          message = 'This email was already registered'
          user_repository = resolve :user_repository
          errors.add 'email', message if user_repository.find_by_email(email)
        end

        validates_format_of :email,
          with: /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\z/i,
          message: 'Is an invalid email'
      end

      class UpdateInformationValidator
        include ActiveModel::Validations
        include ActiveModel::Validations::Callbacks

        attr_accessor :old_user,
                      :email,
                      :old_password,
                      :new_password,
                      :name

        validates_presence_of :name,
          message: 'The field name is required'

        validates_presence_of :old_password,
          message: 'The field password is required'

        validates_presence_of :new_password,
          message: 'The field password is required'

        validates_length_of :new_password, minimum: 8,
          message: 'Your password must be at least 8 characters'

        validates_strength_of :new_password, :with => :email, :level => :good,
          message: 'Your password should include capital letters, lowercase and numbers'

        validate do
          message = 'Incorrect old password'
          errors.add 'old_password', message unless old_user.verify_password(old_password)
        end
      end
    end
  end
end
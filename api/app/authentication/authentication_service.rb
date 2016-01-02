require 'singleton'
require 'bcrypt'

module PasswordStorage
  module Authentication

    class AuthenticationService
      include Singleton

      def authorize(env)
        oauth_service.authorize(env)
      end

      def verify_password(user, password)
        user.verify_password password
      end

      # TODO: Verify access_token expiration
      def verify_access_token(access_token)
        return false if not access_token
        return false if Time.now >= access_token.expires_at
        return true
      end
    end
  end
end
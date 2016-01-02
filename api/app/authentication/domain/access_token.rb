module PasswordStorage
  module Authentication::Domain
    class AccessToken
      attr_accessor :id,
                    :token,
                    :expires_in,
                    :expires_at,
                    :user_id

      def user
        @user ||= user_repository.find(@user_id) unless @user_id.nil?
      end
    end
  end
end
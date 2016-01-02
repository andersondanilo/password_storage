module PasswordStorage
  module Authentication::Domain
    class RefreshToken
      attr_accessor :id,
                    :token,
                    :expires_in,
                    :expires_at,
                    :user_id
    end
  end
end
module PasswordStorage
  module Authentication::Domain
    class AuthorizationCode
      attr_accessor :id,
                    :code,
                    :expires_in,
                    :expires_at
    end
  end
end
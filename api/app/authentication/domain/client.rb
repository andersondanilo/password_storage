module PasswordStorage
  module Authentication::Domain
    class Client
      attr_accessor :id,
                    :client_id,
                    :client_secret
    end
  end
end
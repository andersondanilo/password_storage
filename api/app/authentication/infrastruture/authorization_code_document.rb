require 'singleton'

module PasswordStorage
  module Authentication::Infrastruture
    class AuthorizationCodeDocument
      include Mongoid::Document
      include Mongoid::Timestamps

      store_in collection: "authorization_codes"

      field :code, type: String

      index({code: 1}, {unique: true, background: true})
    end
  end
end
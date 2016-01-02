require 'singleton'

module PasswordStorage
  module Authentication::Infrastruture
    class ClientDocument
      include Mongoid::Document
      include Mongoid::Timestamps

      store_in collection: "clients"

      field :client_id, type: String
      field :client_secret, type: String

      index({client_id: 1}, {unique: true, background: true})
    end
  end
end
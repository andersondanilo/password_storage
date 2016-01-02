module PasswordStorage
  module Core
    module Infrastruture
      class RevisionDocument
        include Mongoid::Document

        field :type, type: String
        field :operations, type: Array
        field :created_at, type: Time, default: ->{ Time.now }

        embedded_in :revisable, polymorphic: true
      end
    end
  end
end
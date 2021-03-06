module PasswordStorage
  module Authentication::Infrastruture
    class RefreshTokenDocument
      include Mongoid::Document
      include Mongoid::Timestamps
      
      field :token, type: String
      field :expires_in, type: Integer
      field :expires_at, type: Time, default: ->{ 15.minutes.since }

      index({token: 1}, {unique: true, background: true})
      index({expires_at: 1}, {background: true})
      index({user_id: 1}, {background: true})

      belongs_to :user, class_name: User::Infrastruture::UserDocument.name

      store_in collection: "refresh_tokens"
    end
  end
end
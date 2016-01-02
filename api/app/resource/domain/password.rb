module PasswordStorage
  module Resource
    module Domain
      class Password
        attr_accessor :id,
                      :uuid,
                      :title,
                      :rev,
                      :username,
                      :password,
                      :informations,
                      :category_uuid,
                      :user_id
      end
    end
  end
end
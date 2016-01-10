module PasswordStorage
  module Resource
    module Domain
      class Category
        attr_accessor :id,
                      :uuid,
                      :rev,
                      :name,
                      :special,
                      :user_id
      end
    end
  end
end
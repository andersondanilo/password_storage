module PasswordStorage
  module Resource
    extend Core::ModuleBase

    module Domain
      autoload_relative File.dirname(__FILE__), 'domain/category'
      autoload_relative File.dirname(__FILE__), 'domain/password'
    end
    
    module Infrastruture      
      autoload_relative File.dirname(__FILE__), 'infrastruture/private_resource_repository'
      autoload_relative File.dirname(__FILE__), 'infrastruture/category_document'
      autoload_relative File.dirname(__FILE__), 'infrastruture/category_repository'
      autoload_relative File.dirname(__FILE__), 'infrastruture/password_document'
      autoload_relative File.dirname(__FILE__), 'infrastruture/password_repository'
    end

    module Presenter
      autoload_relative File.dirname(__FILE__), 'presenter/category_presenter'
      autoload_relative File.dirname(__FILE__), 'presenter/password_presenter'
    end

    autoload_relative File.dirname(__FILE__), 'categories_api'
    autoload_relative File.dirname(__FILE__), 'passwords_api'

    register("presenter:#{Domain::Category.name}", Presenter::CategoryPresenter)
    register("presenter:#{Domain::Password.name}", Presenter::PasswordPresenter)
  end
end
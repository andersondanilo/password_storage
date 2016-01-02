module PasswordStorage
  module User
    extend Core::ModuleBase

    module Domain
      autoload_relative File.dirname(__FILE__), 'domain/user'
    end

    module Infrastruture
      autoload_relative File.dirname(__FILE__), 'infrastruture/user_repository'
      autoload_relative File.dirname(__FILE__), 'infrastruture/user_document'
    end

    module Presenter
      autoload_relative File.dirname(__FILE__), 'presenter/user_presenter'
    end

    # autoload
    autoload_relative File.dirname(__FILE__), 'user_api'
    autoload_relative File.dirname(__FILE__), 'user_service'

    register(:user_repository) { Infrastruture::UserRepository.instance }
    register(:user_service) { UserService.instance }
    register("presenter:#{Domain::User.name}", Presenter::UserPresenter)
  end
end
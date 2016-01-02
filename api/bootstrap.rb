require_relative 'app/api'
require_relative 'app/rack_app'

load PasswordStorage.config_path + '/config.rb'
Mongoid.load!(PasswordStorage.config_path + '/mongoid.yml')
Mongoid.raise_not_found_error = false


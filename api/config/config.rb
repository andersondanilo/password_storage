module PasswordStorage
  def self.config
    @@config ||= Struct.new(:crypt_salt).new
  end

  config.crypt_salt = ENV["PASSWORD_STORAGE_CRYPT_SALT"]

  # Default Presenter
  register :resource_presenter, PasswordStorage::Core::Presenter::JsonApi::ResourcePresenter
  register :validator_presenter, PasswordStorage::Core::Presenter::JsonApi::ValidatorPresenter
end
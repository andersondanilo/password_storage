describe PasswordStorage::User::Infrastruture::UserRepository do
  Domain = PasswordStorage::User::Domain
  Infrastruture = PasswordStorage::User::Infrastruture

  let(:user_repository) { Infrastruture::UserRepository.instance }

  describe '#save' do
    it 'save the user and set id attribute' do
      user = Domain::User.new
      user.name = 'Teste'
      user.email = 'teste@teste.com'

      user_repository.save(user)

      expect(user.id).to_not be_nil
    end
  end

  describe '#find_by_email' do
    it 'return the user entity if found' do
      user_document = create(:user)
      user_entity = user_repository.find_by_email(user_document.email)
      expect(user_entity).to_not be_nil
      expect(user_entity.id).to_not be_nil
      expect(user_entity.email).to eql(user_document.email)
    end
  end
end
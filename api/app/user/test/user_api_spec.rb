require 'base64'
#require 'bcrypt'

describe PasswordStorage::User::UserApi do
  include Rack::Test::Methods

  def app
    PasswordStorage::RackApp.instance
  end

  let (:user) { create(:user, password: 'Password@123') }

  let (:access_token) { create(:access_token, user: user).token }

  describe "POST /api/v1/users" do
    context "Valid register" do
      let :response do
        PasswordStorage::User::Infrastruture::UserDocument.all.delete

        header "Authorization", "Basic #{Base64.encode64(client[:id]+":"+client[:secret])}"

        post "/api/v1/users", {
          data: {
            type: 'users',
            attributes: {
              name: 'My Name',
              email: 'teste@testersonz.com',
              password: 'Password@123'
            }
          }
        }
      end

      it 'Return success' do
        expect(response.status).to eq(201)
      end
    end

    context "Bad password does not work" do
      let :response do
        header "Authorization", "Basic #{Base64.encode64(client[:id]+":"+client[:secret])}"
        
        post "/api/v1/users", {
          data: {
            type: 'users',
            attributes: {
              name: 'My Name',
              email: 'teste@testerson.com',
              password: '12345678'
            }
          }
        }
      end

      it 'Return error' do
        expect(response.status).to eq(400)
      end
    end
  end

  describe "POST /api/v1/users/current/update_informations" do
    context "Valid update" do
      let :response do
        header "Authorization", "Bearer #{access_token}"

        post "/api/v1/users/current/update_informations", {
          data: {
            type: 'users',
            attributes: {
              name: 'My New Name',
              old_password: 'Password@123',
              new_password: 'Password@123'
            }
          }
        }
      end

      let(:response_body) { JSON.parse(response.body) }

      it 'Return success' do
        expect(response.status).to eq(201)
      end
    end

    context "Invalid update" do
      let :response do
        header "Authorization", "Bearer #{access_token}"

        post "/api/v1/users/current/update_informations", {
          data: {
            type: 'users',
            attributes: {
              name: 'My New Name',
              old_password: 'Password@1233',
              new_password: 'Password@123'
            }
          }
        }
      end

      let(:response_body) { JSON.parse(response.body) }

      it 'Return error' do
        expect(response.status).to eq(400)
      end
    end
  end
end
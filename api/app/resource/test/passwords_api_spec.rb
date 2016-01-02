
describe PasswordStorage::Resource::CategoriesApi do
  include Rack::Test::Methods

  def app
    PasswordStorage::RackApp.instance
  end

  let (:user) { create(:user) }

  let (:access_token) { create(:access_token, user: user).token }

  let (:category) { create(:category, user: user) }

  describe "POST /api/v1/categories/:category/passwords" do
    context "When insert password with success" do
      let :response do
        category
        sleep 1
        header "Authorization", "Bearer #{access_token}"
        post "/api/v1/categories/#{category.uuid}/passwords", {
          data: {
            type: 'passwords',
            attributes: {
              uuid: '1-2-3-4',
              rev: nil,
              title: 'My Password',
              username: 'My UserName',
              password: 'My Password',
              informations: [
                {name: 'my info 1', value: 'my value 1'},
                {name: 'my info 2', value: 'my value 2'}
              ]
            }
          }
        }
      end

      it 'Return success' do
        expect(response.status).to eq(201)
      end

      it "Return password information that are sent" do
        json_body = JSON.parse response.body

        expect(response.status).to eq(201)

        expect(json_body["data"]["type"]).to eq("passwords")
        expect(json_body["data"]["id"]).to eq("1-2-3-4")
        expect(json_body["data"]["attributes"]["title"]).to eq('My Password')
        expect(json_body["data"]["attributes"]["username"]).to eq('My UserName')
        expect(json_body["data"]["attributes"]["password"]).to eq('My Password')
        expect(json_body["data"]["attributes"]["informations"].length).to eq(2)
        expect(json_body["data"]["attributes"]["informations"][0]["name"]).to eq("my info 1")
        expect(json_body["data"]["attributes"]["informations"][0]["value"]).to eq('my value 1')
        expect(json_body["data"]["attributes"]["informations"][1]["name"]).to eq("my info 2")
        expect(json_body["data"]["attributes"]["informations"][1]["value"]).to eq('my value 2')
      end      

      it "Return an revision" do
        response

        json_body = JSON.parse response.body
        expect(json_body["data"]["attributes"]["rev"]).to_not be_nil
        expect(json_body["data"]["attributes"]["rev"]).to_not eq("")
      end 
    end
  end


  describe "GET /api/v1/categories/:category/passwords/:password" do
    context "When get password with success" do
      let :password do
        password = create(:password, category: category, user: user)
        password.title = "Password Test"
        password.username = "Username 1"
        password.password = "Password 2"
        password.informations = [
          {name: 'test 1', value: 'value1'},
          {name: 'test 2', value: 'value2'},
        ]
        password.save
        password
      end

      let :response do
        header "Authorization", "Bearer #{access_token}"
        get "/api/v1/categories/#{category.uuid}/passwords/#{password.uuid}"
      end

      it 'Return success' do
        expect(response.status).to eq(200)
      end

      it "Return password information that are on database" do
        json_body = JSON.parse response.body

        expect(json_body["data"]["type"]).to eq("passwords")
        expect(json_body["data"]["id"]).to eq(password.uuid)
        expect(json_body["data"]["attributes"]["title"]).to eq('Password Test')
        expect(json_body["data"]["attributes"]["username"]).to eq('Username 1')
        expect(json_body["data"]["attributes"]["password"]).to eq('Password 2')
        expect(json_body["data"]["attributes"]["informations"].length).to eq(2)
        expect(json_body["data"]["attributes"]["informations"][0]["name"]).to eq("test 1")
        expect(json_body["data"]["attributes"]["informations"][0]["value"]).to eq('value1')
        expect(json_body["data"]["attributes"]["informations"][1]["name"]).to eq("test 2")
        expect(json_body["data"]["attributes"]["informations"][1]["value"]).to eq('value2')
      end

    end
  end

  describe "GET /api/v1/categories/:category/passwords" do
    context "When list passwords with success" do
      let :password1 do
        password = create(:password, category: category, user: user)
        password.title = "Password Test 1"
        password.username = "Username 1"
        password.password = "Password 2"
        password.informations = [
          {name: 'test 1', value: 'value1'},
          {name: 'test 2', value: 'value2'},
        ]
        password.save
        password
      end

      let :password2 do
        password = create(:password, category: category, user: user)
        password.title = "Password Test 2"
        password.username = "Username 1"
        password.password = "Password 2"
        password.informations = [
          {name: 'test 1', value: 'value1'},
          {name: 'test 2', value: 'value2'},
        ]
        password.save
        password
      end

      let :response do
        password1
        password2
        header "Authorization", "Bearer #{access_token}"
        get "/api/v1/categories/#{category.uuid}/passwords"
      end

      it 'Return success' do
        expect(response.status).to eq(200)
      end

      it "Return an list of passwords" do
        json_body = JSON.parse response.body

        expect(json_body["data"].length).to eq(2)

        expect(json_body["data"][0]["type"]).to eq("passwords")
        expect(json_body["data"][0]["id"]).to eq(password1.uuid)
        expect(json_body["data"][0]["attributes"]["title"]).to eq('Password Test 1')
        expect(json_body["data"][0]["attributes"]["username"]).to eq('Username 1')
        expect(json_body["data"][0]["attributes"]["password"]).to eq('Password 2')
        expect(json_body["data"][0]["attributes"]["informations"].length).to eq(2)
        expect(json_body["data"][0]["attributes"]["informations"][0]["name"]).to eq("test 1")
        expect(json_body["data"][0]["attributes"]["informations"][0]["value"]).to eq('value1')
        expect(json_body["data"][0]["attributes"]["informations"][1]["name"]).to eq("test 2")
        expect(json_body["data"][0]["attributes"]["informations"][1]["value"]).to eq('value2')

        expect(json_body["data"][1]["type"]).to eq("passwords")
        expect(json_body["data"][1]["id"]).to eq(password2.uuid)
        expect(json_body["data"][1]["attributes"]["title"]).to eq('Password Test 2')
      end      

    end
  end

  describe "PATCH /api/v1/categories/:category/passwords/:password" do
    context "When update password with success" do
      let :password do
        password = create(:password, category: category, user: user)
        password.title = "Password Test"
        password.username = "Username 1"
        password.password = "Password 2"
        password.informations = [
          {name: 'test 1', value: 'value1'},
          {name: 'test 2', value: 'value2'},
        ]
        password.save
        password
      end

      let :response do
        header "Authorization", "Bearer #{access_token}"
        patch "/api/v1/categories/#{category.uuid}/passwords/#{password.uuid}", {
          data: {
            type: 'passwords',
            attributes: {
              uuid: '1-2-3-4',
              rev: nil,
              title: 'My Passwords',
              username: 'My UserName',
              password: 'My Password',
              informations: [
                {name: 'test 1', value: 'value1'},
                {name: 'my info 2', value: 'my value 2'}
              ]
            }
          }
        }
      end

      it 'Return success' do
        expect(response.status).to eq(200)
      end

      it "Return new password information" do
        json_body = JSON.parse response.body

        expect(json_body["data"]["type"]).to eq("passwords")
        expect(json_body["data"]["id"]).to eq(password.uuid)
        expect(json_body["data"]["attributes"]["title"]).to eq('My Passwords')
        expect(json_body["data"]["attributes"]["username"]).to eq('My UserName')
        expect(json_body["data"]["attributes"]["password"]).to eq('My Password')
        expect(json_body["data"]["attributes"]["informations"].length).to eq(2)
        expect(json_body["data"]["attributes"]["informations"][0]["name"]).to eq("test 1")
        expect(json_body["data"]["attributes"]["informations"][0]["value"]).to eq('value1')
        expect(json_body["data"]["attributes"]["informations"][1]["name"]).to eq("my info 2")
        expect(json_body["data"]["attributes"]["informations"][1]["value"]).to eq('my value 2')
      end      

      it "Return an new revision" do
        response

        expect(password._rev_id).to_not be_nil

        json_body = JSON.parse response.body
        expect(json_body["data"]["attributes"]["rev"]).to_not be_nil
        expect(json_body["data"]["attributes"]["rev"]).to_not eq("")
        expect(json_body["data"]["attributes"]["rev"]).to_not eq(password._rev_id)
      end 
    end
  end

  describe "DELETE /api/v1/categories/:uuid" do
    context "When delete category" do
      let(:password) { create(:password, category: category, user: user) }

      let :response do
        header "Authorization", "Bearer #{access_token}"
        delete "/api/v1/categories/#{category.uuid}/passwords/#{password.uuid}"
      end

      it 'Return success' do
        expect(response.status).to eq(200)
      end

      it "And change state of document" do
        response

        expect(password.reload.active).to eq(false)
      end
    end
  end

end
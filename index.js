require('dotenv').config();
const { login } = require('./scripts/utils/login');
const { createAccount } = require('./Scripts/utils/createAcount')



async function main(){
    const result = await login({
        username: 'newUser',
        password: 'newPassword123',
    });

    const result2 = await createAccount({
        username: 'newUser',
        password: 'newPassword123',
    });
  
}

main()
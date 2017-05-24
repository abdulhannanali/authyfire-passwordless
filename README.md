# Passwordless Authentication with Authy and Firebase

This project demonstrates the integration of Authy for the purpose 
of using Passwordless authentication in Firebase using Firebase Functions.


## Why I built this?

I hate passwords and password managers are not something very accessible and available
on every single device we use. Passwordless Authentication is a secure solution for this purpose, which is easy to integrate within consumer focused mobile and web applications. 

In order to ensure more security, you should try out [Two Factor Authentication](https://www.twilio.com/two-factor-authentication) too.

I also wanted to give two amazing technologies a try, and this was a great way to do that.

### Firebase Functions

Firebase Functions is a serverless way to write Server side code, Firebase functions largely
frees up the need to maintain any kind of server, and frees the developers from worries of 
maintaining and **scaling** servers which is hard for developers like me. So, we can 
focus more on writing the code that matters. 

Firebase functions allow infinite extensibility to the Firebase platform and seamlessly integrate
with rest of the application. They are true to the Firebase goal of making delightful products 
for developers.

### [Authy](https://authy.com)

Authy is the most reliable 2FA and Phone verification solution backed by Twilio in town. 
By using Authy's in built solution for the Token verification, I was able to minimize the work
on my end. I used Firebase functions to integrate with Authy in order to verify the phone number. Authy's 2FA solution worked very well for Passwordless Authentication too. I used a Authy's unofficial Node.js SDK [`node-authy`](https://github.com/evilpacket/node-authy) which has a full support for Authy's API.

## About the application

The application is divided into two parts, firebase functions in order to make the integration with the Authy possible, and a front end application for the Web written largely using ReactJS with the help of few libraries.

### Authy Functions 

The functions responsible for integrating with Authy are located in [functions/authy](functions/authy) along with a few other helper files to help us in our coding (we won't go into a lot of detail about these helper files, help yourself).

Two firebase functions are implemented in order to request and verify the token and are named following:

- requestAuthyToken (Request the token for a given number)
- verifyAuthyToken (Verifies the token for a given number)

These two functions are used to implement the complete Authy Authentication flow through the application. We'll go into the details of the both functions. Feel free to jump into the implementation as well.

Additionally, Authy Functions store the data related to the authentication for the given number,
within the application. So, all the Authy specific data which is by default not (readable/writable) to the user can be found under the below in the Firebase Database.

`/custom-auth/authy/{phoneId}`

Phone ID is the generated unique id for the phone number by combining **Country Code** and **Phone Number** and stripping of anything else but number. 

### Requesting an Authy Token (requestAuthyToken)

Request Authy Token is the first request made in the pursuit of getting a token to be used within our application. 

Method: **POST**

Body Parameters:
  - countryCode
  - phoneNumber
  - forceSMS (optional)

If the user, hasn't been [registered with authy](https://www.twilio.com/docs/api/authy/authy-totp#enabling-two-factor), a non changing authy id is obtained and stored for the given user and saved in the Firebase Database for future use. Following parameters are provided for this request:

- Country Code
- Phone Number
- Email

We currently don't have email for the user at this point, so, email is generated from the number under the firebase project, an email for the following number `+923012548888` will be `phone_923012548888@authyfunctions.firebaseapp.com`, this email is going to be unique as it's registered under a special and unique subdomain. 

Once, the token is sent, we return the response returned to us by the Authy, to the user or handle the errors if any accordingly.

### Verifying an Authy Token (verifyAuthyToken)

Verifies the Authy token for the given phone number, and returns a custom token to be used by the Firebase Authentication in order to login within the application.

Method: **POST**

Body:
 - phoneId
 - token

Once the token is sent, the next step is to verify the token sent to the user. `Authy ID` is required in order to make a request to verify the token to the Authy Servers. A search for the
Authy ID is done, depending on the phone number of the user.

If the Authy ID, for the phone number is not in our database, this means, the user, hasn't been
already registered and should first complete the registration steps, using the first **requestAuthyToken** function.

Afterwards, a request is made to verify authy token for the given authy id. If the verification fails, we return the response based on the failure, to the user, and that helps them to try again, or just abandon it, cos they are hacker or something.

A user id is generated for the given user, which is used to identify the given user, all
accross the Firebase. Since, we used Phone Authentication to sign in the user, we generate the id in the following format `phone:923012548888`.

#### Creating a user

A user is created using the unique user id, we generated in the previous step, if it already does not exist. We can pass in other details too such as, `displayName`, `email`, `emailVerified` but right now, we only have the uid, so we'll have to go with that.

#### Creating a custom token

After, we have created a user, the final step is to generate a custom token, to be used, 
by the client, in order to sign into the application. The `customToken` is created using the `firebase-admin` method `createCustomToken`. 

There can be further permissions passed to `createCustomToken` in order to be used by our client
application, such as the information about type of device, used to receive the token, but right now, no extra permission is being passed. I hope to make use of this feature in the future :smile:

### Credits

Thank you to [Sudheesh Siganamalla](https://github.com/sudheesh001), for letting me use a project in his Firebase account, to complete this application. It wouldn't have been possible with out this.
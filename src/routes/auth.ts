// import { Router } from 'express'
// import { authController } from '@/controllers/authController'
// import { authGuard } from '@/guards'
// import { authValidation } from '@/validations'

// export const auth = (router: Router): void => {
//   router.post(
//     '/auth/sign-in',
//     authGuard.isGuest,
//     authValidation.signIn,
//     authController.signIn
//   )

//   router.post(
//     '/auth/sign-up',
//     authGuard.isGuest,
//     authValidation.signUp,
//     authController.signUp
//   )

//   router.post('/auth/sign-out', authGuard.isAuth, authController.signOut)

//   // // ✅ Reset Password Route (Commented in Controller, Uncomment when needed)
//   // router.post(
//   //   '/auth/password/reset',
//   //   authGuard.isGuest,
//   //   authValidation.resetPassword,
//   //   authController.resetPassword
//   // )

//   // // ✅ Set New Password Route (Commented in Controller, Uncomment when needed)
//   // router.post(
//   //   '/auth/password/new/:accessToken',
//   //   authValidation.newPassword,
//   //   authController.newPassword
//   // )
// }

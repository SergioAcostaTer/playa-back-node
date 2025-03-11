// import { Response } from 'express'
// import { StatusCodes, ReasonPhrases } from 'http-status-codes'
// import { IContextRequest, IUserRequest } from '@/contracts/request'

// export const userController = {
//   me: async (
//     { context: { user } }: IContextRequest<IUserRequest>,
//     response: Response
//   ) => {
//     if (!user) {
//       return response.status(StatusCodes.NOT_FOUND).json({
//         message: ReasonPhrases.NOT_FOUND,
//         status: StatusCodes.NOT_FOUND
//       })
//     }

//     return response.status(StatusCodes.OK).json({
//       data: user,
//       message: ReasonPhrases.OK,
//       status: StatusCodes.OK
//     })
//   }
// }

const asyncHandler = (requestHandler) =>{
    return (req, res, next) =>{
         Promise.resolve(requestHandler(req , res , next)).
         catch((err)=>next(err))
     }
 }
 
 export {asyncHandler}
 
 // const asyHandler = (fn) => async (req , res, next) => {
 //     try{
 //         await fn(req , res , next)
 //     } catch(error){
 //         res.status(error.code || 500).json({
 //             success: false,
 //             message: error.message
 //         })
 //     }
 // }
 
 /**
  * Summary:
  * - `asyncHandler` is a wrapper for async route handlers to handle errors automatically.
  * - Catches errors in asynchronous functions and passes them to Express's error-handling middleware using `next(err)`.
  * - Helps avoid repetitive try-catch blocks in controllers.
  * - The commented-out alternative implementation uses a `try-catch` block instead of `Promise.resolve()`.
  */
 
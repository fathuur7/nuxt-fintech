import { SavingsProduct} from '@/server/models/Saving'

export default defineEventHandler(async (event) => {
  try {
    const products = await SavingsProduct.find({ isActive: true })
    
    return {
      success: true,
      data: products
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }
})
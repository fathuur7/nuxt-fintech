import { SavingsProduct} from '@/server/models/Saving'

export default defineEventHandler(async (event) => {
  try {
    const { name, interestRate, minBalance, maxBalance, description } = await readBody(event)
    
    const product = new SavingsProduct({
      name,
      interestRate,
      minBalance: minBalance || 0,
      maxBalance: maxBalance || null,
      compoundPeriod: 'daily',
      description
    })
    
    await product.save()
    
    return {
      success: true,
      message: 'Savings product created successfully',
      data: product
    }
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }
})
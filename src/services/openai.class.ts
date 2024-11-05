import OpenAI from 'openai'
import { EventEmitter } from 'node:events'
import { ChatCompletionMessageParam } from 'openai/resources/chat'

const OPEN_AI_MODEL = process.env.OPEN_AI_MODEL ?? 'gpt-4o-mini' //gpt-4o-mini

/**
 * Class
 */
class AIClass extends EventEmitter {
  private openai: OpenAI
  constructor(apiKey: string) {
    super()
    this.openai = new OpenAI({ apiKey, timeout: 15 * 1000 })
    if (!apiKey || apiKey.length === 0) {
      throw new Error('OPENAI_KEY is missing')
    }
  }

  createChat = async (messages: ChatCompletionMessageParam[], model?: string, temperature = 0) => {
    try {
      const completion = await this.openai.chat.completions.create({
        model: model ?? OPEN_AI_MODEL,
        messages,
        temperature,
        max_tokens: 1024,
        top_p: 0,
        frequency_penalty: 0,
        presence_penalty: 0
      })
      this.emit('gas_token', {
        amount: (completion?.usage!.total_tokens ?? 0) + 50000
      })
      return completion.choices[0].message.content
    } catch (err) {
      console.error(err)
      return 'ERROR'
    }
  }

  /**
   * experimental! 🔔
   * @param messages
   * @param model
   * @param temperature
   * @returns
   */
}

export default AIClass

import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000"; // backend FastAPI

export class ChatAPI {
  async initializeSession() {
    try {
      const response = await axios.get(`${BASE_URL}/api/init`);
      return { success: true, ...response.data };
    } catch (error) {
      return { success: false };
    }
  }

  async sendMessage(message, sessionId, userId) {
    try {
      const response = await axios.post(`${BASE_URL}/api/chat`, {
        message,
        session_id: sessionId,
        user_id: userId
      });

      return { success: true, data: response.data };
    } catch (error) {
      return { success: false };
    }
  }
}

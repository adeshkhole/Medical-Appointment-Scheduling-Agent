from rag.embeddings import Embeddings
from rag.vector_store import VectorStore

class FAQRAG:

    def __init__(self):
        self.e = Embeddings()
        self.v = VectorStore()

        self.v.add("clinic hours", "We are open 8AM - 6PM.", [])
        self.v.add("location", "We are located at Main Street Hospital.", [])
        self.v.add("insurance", "We accept major insurance providers.", [])

    async def get_answer(self, query: str):
        return self.v.search(query)

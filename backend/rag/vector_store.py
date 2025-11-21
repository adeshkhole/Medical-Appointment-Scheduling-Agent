class VectorStore:

    def __init__(self):
        self.data = []

    def add(self, question, answer, embedding):
        self.data.append({"q": question, "a": answer, "e": embedding})

    def search(self, query):
        if not self.data:
            return None
        return self.data[0]["a"]

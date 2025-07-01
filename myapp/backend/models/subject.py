class Subject:
    def __init__(self, code, title, description):
        self.code = code
        self.title = title
        self.description = description

    @classmethod
    def from_dict(cls, data):
        return cls(
            code=data.get('code'),
            title=data.get('title'),
            description=data.get('description'),
        )

    def to_dict(self):
        return {
            'code': self.code,
            'title': self.title,
            'description': self.description,
        }


from sqlmodel import Session

from app.core.database import engine


class UnitOfWork:
    def __init__(self):
        self.session: Session | None = None

    def __enter__(self):
        self.session = Session(engine)
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        try:
            if self.session is not None:
                if exc_type is not None:
                    self.session.rollback()
                else:
                    self.session.commit()
        finally:
            if self.session is not None:
                self.session.close()
                self.session = None

        return False


from typing import Any, Generic, TypeVar

from sqlmodel import Session, SQLModel, select


ModelType = TypeVar("ModelType", bound=SQLModel)


class BaseRepository(Generic[ModelType]):
    def __init__(self, session: Session, model: type[ModelType]):
        self.session = session
        self.model = model

    def get_by_id(self, entity_id: int) -> ModelType | None:
        return self.session.get(self.model, entity_id)

    def get_all(self) -> list[ModelType]:
        statement = select(self.model)
        return list(self.session.exec(statement).all())

    def add(self, entity: ModelType) -> ModelType:
        self.session.add(entity)
        self.session.flush()
        self.session.refresh(entity)
        return entity

    def create(self, entity: ModelType) -> ModelType:
        return self.add(entity)

    def update(self, entity: ModelType) -> ModelType:
        self.session.add(entity)
        self.session.flush()
        self.session.refresh(entity)
        return entity

    def delete(self, entity: ModelType) -> None:
        self.session.delete(entity)
        self.session.flush()

    def get_by_field(
        self,
        field_name: str,
        value: Any,
    ) -> ModelType | None:
        field = getattr(self.model, field_name)
        statement = select(self.model).where(field == value)
        return self.session.exec(statement).first()

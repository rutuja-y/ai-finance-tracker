from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models.transaction import Transaction
from utils.auth_utils import decode_token
from jose import JWTError

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def get_transactions(db: Session = Depends(get_db), authorization: str = Header(None)):

    if not authorization:
        raise HTTPException(status_code=401, detail="Token missing")

    try:
        token = authorization.split(" ")[1]
        user = decode_token(token)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    data = db.query(Transaction).filter(Transaction.user_id == user["user_id"]).all()

    return data


@router.post("/add")
def add_transaction(data: dict, db: Session = Depends(get_db), authorization: str = Header(None)):
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Token missing")

    try:
        token = authorization.split(" ")[1]
        user = decode_token(token)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    new_txn = Transaction(
        text=data["text"],
        amount=data["amount"],
        type=data["type"],
        category=data["category"],
        user_id=user["user_id"]
    )

    db.add(new_txn)
    db.commit()

    return {"message": "Transaction added"}

@router.delete("/{id}")
def delete_transaction(id: int, db: Session = Depends(get_db), authorization: str = Header(None)):

    if not authorization:
        raise HTTPException(status_code=401, detail="Token missing")

    token = authorization.split(" ")[1]
    user = decode_token(token)

    txn = db.query(Transaction).filter(
        Transaction.id == id,
        Transaction.user_id == user["user_id"]
    ).first()

    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    db.delete(txn)
    db.commit()

    return {"message": "Transaction deleted"}

@router.put("/{id}")
def update_transaction(
    id: int,
    data: dict,
    db: Session = Depends(get_db),
    authorization: str = Header(None)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token missing")

    token = authorization.split(" ")[1]
    user = decode_token(token)

    txn = db.query(Transaction).filter(
        Transaction.id == id,
        Transaction.user_id == user["user_id"]
    ).first()

    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Update fields
    txn.text = data.get("text", txn.text)
    txn.amount = data.get("amount", txn.amount)
    txn.type = data.get("type", txn.type)
    txn.category = data.get("category", txn.category)

    db.commit()

    return {"message": "Transaction updated"}
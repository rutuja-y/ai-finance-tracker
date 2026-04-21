from fastapi import APIRouter, Header, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.budget import Budget
from utils.auth_utils import decode_token

# ✅ DEFINE ROUTER FIRST
router = APIRouter(prefix="/budgets")

# ---------------- GET ----------------
@router.get("/")
def get_budgets(
    db: Session = Depends(get_db),
    authorization: str = Header(None)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token missing")

    try:
        token = authorization.split(" ")[1]
        user = decode_token(token)
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

    data = db.query(Budget).filter(Budget.user_id == user["user_id"]).all()

    return data


# ---------------- POST ----------------
@router.post("/")
def add_budget(
    data: dict,
    db: Session = Depends(get_db),
    authorization: str = Header(None)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token missing")

    try:
        token = authorization.split(" ")[1]
        user = decode_token(token)
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

    new_budget = Budget(
        category=data["category"],
        limit=data["limit"],
        user_id=user["user_id"]
    )

    db.add(new_budget)
    db.commit()

    return {"message": "Budget added"}

@router.delete("/{id}")
def delete_budget(
    id: int,
    db: Session = Depends(get_db),
    authorization: str = Header(None)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token missing")

    try:
        token = authorization.split(" ")[1]
        user = decode_token(token)
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

    budget = db.query(Budget).filter(
        Budget.id == id,
        Budget.user_id == user["user_id"]
    ).first()

    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    db.delete(budget)
    db.commit()

    return {"message": "Deleted"}
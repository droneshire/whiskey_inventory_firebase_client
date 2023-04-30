# NC ABC Whiskey Inventory Management Front End

React based website backed by Firebase database to manage the clients and their inventory monitoring settings.

[6a2f0fff-8a6e-45b4-86ca-9cd0f34d5bfb](https://user-images.githubusercontent.com/2355438/235330476-081752b0-11b5-4ebd-8696-3590f8f44571.jpeg)

The server side is located at: https://github.com/droneshire/whiskey_inventory_alert_upwork

# Models!

### Client
```
class Client(Base):
    __tablename__ = "Client"

    id = Column(types.Integer, primary_key=True)
    name = Column(types.String(80), unique=True, nullable=False)
    items = relationship("Item", backref="Client")
    email = Column(types.String(80), unique=True, nullable=False)
    phone_number = Column(types.String(11), unique=True, nullable=False)
    threshold_inventory = Column(types.Integer, nullable=True, default=1)
    last_updated = Column(types.DateTime(timezone=True), nullable=True)
    updates_sent = Column(types.Integer, nullable=True, default=0)
    created_at = Column(types.DateTime(timezone=True), server_default=func.now())
```

# Future Work

- Billing framework, either monthly/yearly or by notification?

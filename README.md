# NC ABC Whiskey Inventory Management Front End

React based website backed by Firebase database to manage the clients and their inventory monitoring settings.

![logo](https://user-images.githubusercontent.com/2355438/235367406-de28a385-98d8-4d11-9438-df73ea5da651.png)

The server side is located at: https://github.com/droneshire/whiskey_inventory_alert_upwork

# Dashboard
The dashboard contains several views, one of which is an admin only view:

- Admin - manage all clients' inventory preferences
- Inventory - add inventory to track and manage alert inventory change threshold
- Preferences - manage contact info and alert preferences

# Models

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

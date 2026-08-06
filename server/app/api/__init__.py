from . import auth, applications, catalog, checkout, orders, documents, support, compliance, contact, account, notifications

blueprints = (
    auth.bp, applications.bp, catalog.bp, checkout.bp, orders.bp,
    documents.bp, support.bp, compliance.bp, contact.bp, account.bp, notifications.bp,
)

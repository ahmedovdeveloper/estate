from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request
from starlette.responses import RedirectResponse
from .models import User, Property, Lead, Agent

class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()
        username = form.get("username")
        password = form.get("password")

        # Standard admin authentication
        if username == "admin" and password == "admin":
            request.session.update({"token": "admin_session_valid"})
            return True
        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        token = request.session.get("token")
        if not token:
            return False
        return True

class UserAdmin(ModelView, model=User):
    name = "Пользователь"
    name_plural = "Пользователи"
    icon = "fa-solid fa-users"
    column_list = [User.id, User.username, User.name, User.email, User.phone, User.role, User.created_at]
    column_searchable_list = [User.username, User.name, User.email, User.phone]
    column_sortable_list = [User.created_at, User.role, User.username]
    column_filters = [User.role]
    can_create = True
    can_edit = True
    can_delete = True
    can_view_details = True

class PropertyAdmin(ModelView, model=Property):
    name = "Объект недвижимости"
    name_plural = "Объекты недвижимости"
    icon = "fa-solid fa-building"
    column_list = [
        Property.id,
        Property.title,
        Property.price,
        Property.currency,
        Property.deal_type,
        Property.property_type,
        Property.city,
        Property.neighborhood,
        Property.bedrooms,
        Property.featured,
        Property.status
    ]
    column_searchable_list = [Property.title, Property.city, Property.neighborhood, Property.address]
    column_sortable_list = [Property.price, Property.created_at, Property.bedrooms, Property.rating]
    column_filters = [Property.city, Property.deal_type, Property.property_type, Property.featured, Property.status]
    can_create = True
    can_edit = True
    can_delete = True
    can_view_details = True

class LeadAdmin(ModelView, model=Lead):
    name = "Заявка / Лид"
    name_plural = "Заявки на просмотр"
    icon = "fa-solid fa-envelope-open-text"
    column_list = [Lead.id, Lead.client_name, Lead.client_phone, Lead.client_email, Lead.status, Lead.created_at]
    column_searchable_list = [Lead.client_name, Lead.client_phone, Lead.client_email]
    column_sortable_list = [Lead.created_at, Lead.status]
    column_filters = [Lead.status]
    can_create = True
    can_edit = True
    can_delete = True
    can_view_details = True

class AgentAdmin(ModelView, model=Agent):
    name = "Агент / Риелтор"
    name_plural = "Агенты"
    icon = "fa-solid fa-user-tie"
    column_list = [Agent.id, Agent.name, Agent.phone, Agent.email, Agent.rating, Agent.deals_count, Agent.verified]
    column_searchable_list = [Agent.name, Agent.phone, Agent.email]
    can_create = True
    can_edit = True
    can_delete = True

def setup_admin(app, engine):
    """Mounts the interactive SQLAdmin dashboard to FastAPI app at /admin"""
    authentication_backend = AdminAuth(secret_key="uzestate-super-secret-admin-key-2026")
    admin = Admin(
        app=app,
        engine=engine,
        title="UzEstate Pro Admin Dashboard",
        base_url="/admin",
        authentication_backend=authentication_backend,
        templates_dir=None
    )

    admin.add_view(PropertyAdmin)
    admin.add_view(UserAdmin)
    admin.add_view(LeadAdmin)
    admin.add_view(AgentAdmin)
    return admin

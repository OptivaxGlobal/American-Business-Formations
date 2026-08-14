"""Documents & Verification: registered-agent e-signature, generated-
document review acknowledgement, and document requirement/review fields.

Revision ID: c3f7a1b9e402
Revises: 9a10bafa2f5b
Create Date: 2026-08-13 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c3f7a1b9e402'
down_revision = '9a10bafa2f5b'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('registered_agents', schema=None) as batch_op:
        batch_op.add_column(sa.Column('signer_name', sa.String(length=200), nullable=True))

    with op.batch_alter_table('formation_applications', schema=None) as batch_op:
        batch_op.add_column(sa.Column('formation_data_confirmed_at', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('formation_data_version', sa.Integer(), nullable=False, server_default='0'))

    with op.batch_alter_table('documents', schema=None) as batch_op:
        batch_op.add_column(sa.Column('requirement_type', sa.String(length=20), nullable=False, server_default='optional'))
        batch_op.add_column(sa.Column('status', sa.String(length=20), nullable=False, server_default='uploaded'))
        batch_op.add_column(sa.Column('reviewed_at', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('reviewed_by', sa.String(length=36), nullable=True))
        batch_op.add_column(sa.Column('reviewer_notes', sa.Text(), nullable=True))
        batch_op.create_foreign_key('fk_documents_reviewed_by_users', 'users', ['reviewed_by'], ['id'])


def downgrade():
    with op.batch_alter_table('documents', schema=None) as batch_op:
        batch_op.drop_constraint('fk_documents_reviewed_by_users', type_='foreignkey')
        batch_op.drop_column('reviewer_notes')
        batch_op.drop_column('reviewed_by')
        batch_op.drop_column('reviewed_at')
        batch_op.drop_column('status')
        batch_op.drop_column('requirement_type')

    with op.batch_alter_table('formation_applications', schema=None) as batch_op:
        batch_op.drop_column('formation_data_version')
        batch_op.drop_column('formation_data_confirmed_at')

    with op.batch_alter_table('registered_agents', schema=None) as batch_op:
        batch_op.drop_column('signer_name')

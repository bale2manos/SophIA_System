from flask import Blueprint

bp = Blueprint('api', __name__)

from . import auth, subjects, resources, practices  # noqa

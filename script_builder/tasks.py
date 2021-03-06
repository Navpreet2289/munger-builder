import os

from django.http import HttpResponse
from django.conf import settings

from celery import task, shared_task
from celery.utils.log import get_task_logger

import scripts.run_munger
import scripts.build_munger

from .models import MungerBuilder

logger = get_task_logger(__name__)

@shared_task
def run_munger(munger_builder_id=1):
    return [log_entry for log_entry in scripts.run_munger.main(munger_builder_id)]

@shared_task
def download_munger_async(munger_builder_id=1):
    mb = MungerBuilder.objects.get(pk=munger_builder_id)
    script_string = scripts.build_munger.main(munger_builder_id)
    return '{0}.py'.format(mb.safe_file_name)

@shared_task
def download_test_data_async(munger_builder_id=1):
    return 'test_data.csv'

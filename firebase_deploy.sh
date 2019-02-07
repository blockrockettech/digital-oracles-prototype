#!/usr/bin/env bash

firebase use digital-oracles;
firebase deploy --only functions;

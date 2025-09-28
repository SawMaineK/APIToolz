<?php

namespace Sawmainek\Apitoolz\Integrations\Plugins;

interface PluginInterface
{
    public function apply(array $config, array $body, array $context): array;
}

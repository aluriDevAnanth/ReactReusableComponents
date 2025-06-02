import {
  ActionIcon,
  Box,
  Burger,
  Button,
  Divider,
  Drawer,
  Group,
  ScrollArea,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, useLocation } from "react-router";
import clsx from "clsx";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

export default function HeaderMegaMenu() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const location = useLocation();
  const [theme, setTheme] = useState<"system" | "dark" | "light">("system");
  const { setColorScheme } = useMantineColorScheme();

  function ToggleTheme() {
    const currTheme =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;

    (document.getRootNode() as Document).documentElement.setAttribute(
      "tw-data-theme",
      currTheme
    );
    setColorScheme(currTheme);
  }

  useEffect(() => {
    ToggleTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  return (
    <Box className="m-3">
      <header>
        <div className="flex justify-between items-center h-full">
          <Link className="  text-3xl" to="/">
            Home
          </Link>

          <Group h="100%" gap={20} visibleFrom="sm">
            <Link
              className={clsx(
                "hover:text-blue-500",
                location.pathname == "/form_testing" && "font-bold"
              )}
              to="/form_testing"
            >
              FormTesting
            </Link>
            <Link
              className={clsx(
                "hover:text-blue-500",
                location.pathname == "/table_testing" && "font-bold"
              )}
              to="/table_testing"
            >
              TableTesting
            </Link>
          </Group>

          <Group visibleFrom="sm">
            <Button variant="default">Log in</Button>
            <ActionIcon
              onClick={() => {
                setTheme((prev) => {
                  if (prev === "light") return "dark";
                  if (prev === "dark") return "system";
                  return "light";
                });
              }}
              size="lg"
            >
              {theme === "system" && <Icon icon={`tabler:device-desktop`} />}
              {theme === "dark" && <Icon icon={`tabler:moon`} />}
              {theme === "light" && <Icon icon={`tabler:sun`} />}
            </ActionIcon>
          </Group>

          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            hiddenFrom="sm"
          />
        </div>
      </header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h="calc(100vh - 80px" mx="-md">
          <Divider my="sm" />

          <Link
            className={clsx(
              "hover:text-blue-500",
              location.pathname == "/form_testing" && "font-bold"
            )}
            to="/form_testing"
          >
            FormTesting
          </Link>

          <Divider my="sm" />

          <Group justify="center" grow pb="xl" px="md">
            <Button variant="default">Log in</Button>
            <Button>Sign up</Button>
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}

"use client";

// TODO: add popup to have user accept cookies (react-cookie)
// TODO: add isolate and smooth color transition settings to cookies
// TODO: add drag and drop functionality to reorder colors (maybe use react-beautiful-dnd)

// TODO: update styling for mobile view
// TODO: add tooltips to icons and settings

// FIXED: fix bug where re-render causes colors to unlock (shallow routing fix or alternative?) (fixed with history.replaceState)
// FIXED: cant have both transitions at the same time
// DONE: add a color picker to change colors when hex is clicked
// DONE: add isolate colors and smooth color transition
// DONE: PUT BANNER IN IF NO COOKIES ARE ALLOWED YET
// DONE: update styling on color picker

import { Button } from "@/components/ui/button";
import { Copy, Lock, MoreHorizontal, Plus, Trash2, Unlock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { redirect, useParams, useRouter } from "next/navigation";
import { GetColorName } from "hex-color-to-color-name";
import { ColorTranslator } from "colortranslator";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

import {
	Dialog,
	DialogHeader,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

import { HexColorPicker, HexColorInput } from "react-colorful";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCookies } from "next-client-cookies";

import Link from "next/link";
import {
	AlertDialog,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogAction,
	AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const Home = () => {
	const cookies = useCookies();
	const initSecondary = cookies.get("secondary");
	const [isMounted, setIsMounted] = useState<boolean>(false);

	const [secondary, setSecondary] = useState<any>(initSecondary);

	// store the palette in state
	const [palette, setPalette] = useState<any[]>([]);

	const [isolate, setIsolate] = useState<boolean>(false);
	const [smoothColorChange, setSmoothColorChange] = useState<boolean>(false);

	// get the palette from the url
	const { id } = useParams();
	// get the router (removed for now, replaced with history.replaceState)
	const router = useRouter();

	// generate a random hex color, returns a string
	const randomColor = () => {
		const hex = Math.floor(Math.random() * 0xffffff);
		return "#" + hex.toString(16).padEnd(6, "0");
	};

	// create a function to check whether a string is a valid hex color, returns a boolean
	const isValidHex = (hex: string) => {
		if (hex.length != 7) return false;
		if (hex[0] != "#") return false;
		for (let i = 1; i < hex.length; i++) {
			if (
				!(
					(hex[i] >= "0" && hex[i] <= "9") ||
					(hex[i] >= "a" && hex[i] <= "f") ||
					(hex[i] >= "A" && hex[i] <= "F")
				)
			)
				return false;
		}
		return true;
	};

	// create a function to check whether a string is a valid hex color without the #, returns a boolean
	const isValidHexNoHash = (hex: string) => {
		if (hex.length != 6) return false;
		for (let i = 0; i < hex.length; i++) {
			if (
				!(
					(hex[i] >= "0" && hex[i] <= "9") ||
					(hex[i] >= "a" && hex[i] <= "f") ||
					(hex[i] >= "A" && hex[i] <= "F")
				)
			)
				return false;
		}
		return true;
	};

	// create a function to convert a set of hex colors into a url, returns a string
	const hexSetToUrl = (hexes: any) => {
		let url = "";
		hexes.map((hex: any) => {
			url += hex.color.slice(1) + "-";
		});
		url = url.slice(0, -1);
		// console.log(url);
		return url;
	};

	// create a function to validate a set of hex colors separated by dashes, returns an array of valid hexes. If input is "generate" returns an array of 5 random hexes
	const validateHexSet = (hex: any) => {
		if (hex == "generate") {
			let buffer = [
				{ color: randomColor(), locked: false, index: 0 },
				{ color: randomColor(), locked: false, index: 1 },
				{ color: randomColor(), locked: false, index: 2 },
				{ color: randomColor(), locked: false, index: 3 },
				{ color: randomColor(), locked: false, index: 4 },
			];

			// router.push(hexSetToUrl(buffer), undefined, { shallow: true });
			history.replaceState(null, "", hexSetToUrl(buffer));

			return buffer;
		}

		// If the url doesnt contain a valid hex set, redirect to generate, this does not affect routing,
		// but it does prevent users from getting stuck with no valid hexes

		// If the url is shorter than 6 characters, check if it is a valid hex
		if (hex.split("").length < 6) {
			console.log(`Hex '${hex}' is invalid`);
			return redirect("/generate");
			// If the url is 6 characters long, check if it is a valid hex
		} else if (hex.split("").length == 6 && isValidHexNoHash(hex) == false) {
			console.log(`Hex '${hex}' is invalid`);
			return redirect("/generate");
		}
		// If the url is longer than 6 characters, check if it is a valid hex set
		if (hex.split("").length > 6) {
			// check if the url contains dashes
			if (hex.includes("-") == false) {
				console.log(`Hex '${hex}' is invalid`);
				return redirect("/generate");

				// check if the url contains more than 5 dashes
			} else if (hex.split("-").length > 5) {
				console.log(`Cannot load more than 5 hex values`);
				return redirect("/generate");
				// if the url contains only one section, check if it is a valid hex
			} else if (hex.split("-").length == 1) {
				if (isValidHex(hex) == false) {
					console.log(`Hex '${hex}' is invalid`);
					return redirect("/generate");
				}
				// if the url contains more than one section, check if each section is a valid hex
			} else if (
				hex.split("-").length > 1 &&
				hex.split("-").length <= 5 &&
				hex.split("-").every((hexx: string) => isValidHexNoHash(hexx)) == true
			) {
				let buffer: any[] = [];
				let bufferCounter: number = 0;

				const hexes = hex.split("-");
				hexes.map((hex: any) => {
					if (hex.length !== 6) {
						console.log(`Hex must be 6 characters long`);
						return null;
					}
					if (isValidHexNoHash(hex) == false) {
						console.log(`Hex '${hex}' is invalid`);
						return null;
					}
					if (isValidHexNoHash(hex) == true) {
						// console.log(`Hex '${hex}' is valid`);
						hex = "#" + hex;
						buffer.push({
							color: hex,
							locked: false,
							index: bufferCounter,
						});
						bufferCounter++;
					}
				});
				return buffer;
			} else return redirect("/generate");
		}

		let buffer: any[] = [];
		let bufferCounter: number = 0;

		const hexes = hex.split("-");
		hexes.map((hex: any) => {
			if (hex.length !== 6) {
				console.log(`Hex must be 6 characters long`);
				return null;
			}
			if (isValidHexNoHash(hex) == false) {
				console.log(`Hex '${hex}' is invalid`);
				return null;
			}
			if (isValidHexNoHash(hex) == true) {
				// console.log(`Hex '${hex}' is valid`);
				hex = "#" + hex;
				buffer.push({
					color: hex,
					locked: false,
					index: bufferCounter,
				});
				bufferCounter++;
			}
		});
		// console.log("buffer", buffer);
		return buffer;
	};

	// add event listener to randomizeButton to allow for spacebar to randomize
	const keyDownHandler = (event: { keyCode: any }) => {
		if (event.keyCode == "32") {
			document.getElementById("randomizeButton")?.click();
		}
	};

	// change the color of the palette
	const changePalette = () => {
		const newPalette = palette.map((color) => {
			if (color.locked) return color;
			return {
				color: randomColor(),
				locked: false,
				index: color.index,
			};
		});
		setPalette(newPalette);
	};

	// add a new color to the palette
	const addColor = () => {
		if (palette.length > 4) {
			toast.error("You can't add more than 5 colors!");
			return;
		}

		const newPalette = palette.map((color) => {
			return { color: color.color, locked: color.locked, index: color.index };
		});
		newPalette.push({
			color: randomColor(),
			locked: false,
			index: newPalette.length,
		});
		setPalette(newPalette);
	};

	// remove a color from the palette
	const removeColor = (index: number) => {
		if (palette.length == 1) {
			toast.error("You can't remove the last color!");
			return;
		}
		const newPalette = palette.filter((color) => {
			if (color.locked == true && color.index == index)
				toast.error("You can't remove a locked color!");

			return color.index != index || color.locked == true;
		});
		setPalette(newPalette);
	};

	// handle the lock/unlock for colors
	const handleLock = (hex: string) => {
		const newPalette = palette.map((color) => {
			if (color.color == hex) {
				return {
					color: color.color,
					locked: !color.locked,
					index: color.index,
					hover: color.hover,
				};
			}
			return color;
		});
		setPalette(newPalette);
	};

	// create a function to determine whether a color is light or dark, returns a boolean
	const isLight = (color: string) => {
		const hex = color.slice(1);
		const r = parseInt(hex.slice(0, 2), 16);
		const g = parseInt(hex.slice(2, 4), 16);
		const b = parseInt(hex.slice(4, 6), 16);
		const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
		if (luma < 128) return false;
		return true;
	};

	// create a function to convert a hex color to rgb, returns a string
	const hexToRGB = (hex: string) => {
		const rgbArray = ColorTranslator.toRGB(hex).split(" ");
		const r = rgbArray[0].slice(4, -1);
		const g = rgbArray[1].slice(0, -1);
		const b = rgbArray[2].slice(0, -1);
		const rgb = [r, g, b].map((value: string) => {
			if (Number.isNaN(parseInt(value))) return "0";
			return parseInt(value);
		});

		return rgb.join(", ");
	};

	// create a function to convert a hex color to hsl, returns a string
	const hexToHSL = (hex: string) => {
		const hslArray = ColorTranslator.toHSL(hex).split(" ");
		const h = hslArray[0].slice(4, -1);
		const s = hslArray[1].slice(0, -1);
		const l = hslArray[2].slice(0, -1);
		const hsl = [h, s, l].map((value: string) => {
			if (Number.isNaN(parseInt(value))) return "0";
			return parseInt(value);
		});

		return hsl.join(", ");
	};

	// create a function to convert a hex color to cmyk, returns a string
	const hexToCMYK = (hex: string) => {
		const cmykArray = ColorTranslator.toCMYK(hex).split(" ");
		const c = cmykArray[0].slice(4, -1);
		const m = cmykArray[1].slice(0, -1);
		const y = cmykArray[2].slice(0, -1);
		const k = cmykArray[3].slice(0, -1);
		const cmyk = [c, m, y, k].map((value: string) => {
			if (Number.isNaN(parseInt(value))) return "0";
			return parseInt(value);
		});

		return cmyk.join(", ");
	};

	// create a function to convert a hex color to lab, returns a string
	const hexToLAB = (hex: string) => {
		const labArray = ColorTranslator.toCIELab(hex).split(" ");
		const l = labArray[0].slice(4, -1);
		const a = labArray[1].slice(0, -1);
		const b = labArray[2].slice(0, -1);
		const lab = [l, a, b].map((value: string) => {
			if (Number.isNaN(parseInt(value))) return "0";
			return parseInt(value);
		});

		return lab.join(", ");
	};

	// validate the palette on page load and when the url changes and add event listener to randomizeButton
	useEffect(() => {
		setIsMounted(true);

		let check: any[] = validateHexSet(id);
		// console.log(check);
		if (check[0] === "generate") {
			history.replaceState(null, "", "generate");
		}
		setPalette(validateHexSet(id));

		// add event listener to randomizeButton
		document.addEventListener("keydown", keyDownHandler);
		return () => {
			document.removeEventListener("keydown", keyDownHandler);
		};
	}, []);

	// cookies on load
	const [cookiesEnabled, setCookiesEnabled] = useState<boolean | undefined>();
	useEffect(() => {
		const cookieStore = cookies.get();

		// check if cookie preference is set
		if (cookieStore.cookiesAllowed == undefined) {
			// console.log("Cookies are disabled");
		}

		// if cookies are disabled, set cookies to disabled
		if (cookieStore.cookiesAllowed == "false") {
			setCookiesEnabled(false);
			// console.log("Cookies are disabled");
		}

		// if cookies are enabled, but no settings are set, set cookies to default
		if (
			cookieStore.cookiesAllowed == "true" &&
			cookieStore.isolate == undefined &&
			cookieStore.smoothColorChange == undefined &&
			cookieStore.secondary == undefined
		) {
			setCookiesEnabled(true);

			cookies.set("isolate", "false", {
				expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
			});
			cookies.set("smoothColorChange", "false", {
				expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
			});
			cookies.set("secondary", "name", {
				expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
			});
			setSecondary("name");
		}

		// if cookies are enabled and settings are set, set state to equal cookies
		if (
			cookieStore.cookiesAllowed == "true" &&
			cookieStore.isolate != undefined &&
			cookieStore.smoothColorChange != undefined &&
			cookieStore.secondary != undefined
		) {
			setCookiesEnabled(true);

			if (cookies.get("isolate") == "true" && isolate != true) {
				setIsolate(true);
			}
			if (
				cookies.get("smoothColorChange") == "true" &&
				smoothColorChange != true
			) {
				setSmoothColorChange(true);
			}

			if (secondary == "name" && cookieStore.secondary != "name") {
				cookies.set("secondary", "name", {
					expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
				});
				setSecondary("name");
			}
			if (secondary == "rgb" && cookieStore.secondary != "rgb") {
				cookies.set("secondary", "rgb", {
					expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
				});
				setSecondary("rgb");
			}
			if (secondary == "hsl" && cookieStore.secondary != "hsl") {
				cookies.set("secondary", "hsl", {
					expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
				});
				setSecondary("hsl");
			}
			if (secondary == "cmyk" && cookieStore.secondary != "cmyk") {
				cookies.set("secondary", "cmyk", {
					expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
				});
				setSecondary("cmyk");
			}
			if (secondary == "lab" && cookieStore.secondary != "lab") {
				cookies.set("secondary", "lab", {
					expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
				});
				setSecondary("lab");
			}
		}
		console.log(cookieStore); // TEST line to log cookies
		console.log(secondary); // TEST line to log secondary

		// cookies.remove("cookiesAllowed"); // TEST line to remove cookies
		// cookies.remove("isolate"); // TEST line to remove cookies
		// cookies.remove("smoothColorChange"); // TEST line to remove cookies
		// cookies.remove("secondary"); // TEST line to remove cookies
	}, [isolate, smoothColorChange, secondary, cookiesEnabled]);

	useEffect(() => {
		history.replaceState(null, "", hexSetToUrl(palette));
	}, [palette]);

	return (
		<div className="grid grid-rows-[repeat(1fr)] select-none min-h-screen grid-flow-row">
			{isMounted && cookiesEnabled == undefined && (
				<AlertDialog defaultOpen>
					<AlertDialogContent>
						<div>
							<AlertDialogHeader>
								<AlertDialogTitle>Cookies</AlertDialogTitle>
								<AlertDialogDescription>
									We use cookies to store your preferences for the generator. We
									will never store or share your personal information. <br />
									If you have any questions, please refer to our{" "}
									<Button className="p-0" asChild variant={"link"}>
										<Link href={"/"}>cookie policy.</Link>
									</Button>
								</AlertDialogDescription>
							</AlertDialogHeader>
						</div>
						<div className="flex justify-between items-center p-2 gap-4">
							<AlertDialogCancel
								asChild
								className="bg-destructive border-none hover:bg-destructive/90 hover:text-foreground-content"
							>
								<Button
									variant={"destructive"}
									onClick={() => {
										cookies.set("cookiesAllowed", "false", {
											expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
										});
										setCookiesEnabled(false);
									}}
								>
									Decline
								</Button>
							</AlertDialogCancel>
							<AlertDialogAction autoFocus asChild>
								<Button
									onClick={() => {
										cookies.set("cookiesAllowed", "true", {
											expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
										});
										setCookiesEnabled(true);
									}}
								>
									Accept Cookies
								</Button>
							</AlertDialogAction>
						</div>
					</AlertDialogContent>
				</AlertDialog>
			)}
			<Dialog>
				<>
					<div className="fixed z-50 px-8 py-2 flex flex-col gap-2 left-0 top-0 rounded-br-xl bg-background/35 backdrop-blur-xl shadow-md">
						<p className="font-black text-2xl tracking-tight">re: coolors</p>
						<p className="min-w-fit text-sm text-foreground">
							Press the spacebar to generate a color palette!
						</p>
					</div>
					<div className="flex fixed z-50 px-8 py-2 right-0 top-0 rounded-bl-xl justify-between gap-4 items-center bg-background/35 backdrop-blur-xl shadow-md">
						<div className="flex gap-4 w-full justify-end ">
							<DialogTrigger asChild>
								<Button asChild size={"icon"} variant={"ghost"}>
									<div className="cursor-pointer rounded-full">
										<MoreHorizontal className="h-4 w-4" />
									</div>
								</Button>
							</DialogTrigger>

							<DialogContent className="max-w-sm">
								<DialogHeader>
									<DialogTitle>Settings</DialogTitle>
									<Separator className="w-full" />
								</DialogHeader>
								<div className=" text-muted-foreground font-medium flex justify-between items-center">
									<p>Secondary info</p>
									<Select
										defaultValue={secondary}
										onValueChange={(
											value: "name" | "rgb" | "hsl" | "cmyk" | "lab"
										) => setSecondary(value)}
									>
										<SelectTrigger className="w-[180px]">
											<SelectValue placeholder={"Default: Name"} />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="name">Name</SelectItem>
											<SelectItem value="rgb">RGB</SelectItem>
											<SelectItem value="hsl">HSL</SelectItem>
											<SelectItem value="cmyk">CMYK</SelectItem>
											<SelectItem value="lab">LAB</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className=" text-muted-foreground font-medium flex justify-between items-center">
									<p>Isolate colors</p>
									<Checkbox
										className="scale-125"
										checked={isolate}
										onClick={() => {
											setIsolate(!isolate);
											cookiesEnabled &&
												cookies.set("isolate", `${!isolate},`, {
													expires: new Date(
														Date.now() + 1000 * 60 * 60 * 24 * 7
													),
												});
										}}
									/>
								</div>
								<div className=" text-muted-foreground font-medium flex justify-between items-center">
									<p>Smooth color transition</p>
									<Checkbox
										className="scale-125"
										checked={smoothColorChange}
										onClick={() => {
											setSmoothColorChange(!smoothColorChange);
											cookiesEnabled &&
												cookies.set(
													"smoothColorChange",
													`${!smoothColorChange}`,
													{
														expires: new Date(
															Date.now() + 1000 * 60 * 60 * 24 * 7
														),
													}
												);
										}}
									/>
								</div>
							</DialogContent>

							<div className="bg-black/90 w-[1px] rounded-full" />
							<Button asChild onClick={() => addColor()}>
								<div className="cursor-pointer rounded-full">
									Add a color
									<Plus className="h-4 w-4 ml-2" />
								</div>
							</Button>

							{/* RANDOMIZE BUTTON */}
							<Button
								id="randomizeButton"
								className={"hidden"}
								onClick={changePalette}
							>
								randomize!
							</Button>
						</div>
					</div>
				</>

				<div id="colors" className="grid grid-flow-col">
					{palette.map((color) => (
						<div
							key={color.index}
							className={`flex justify-end pb-20 flex-col space-y-8 items-center 
									${isLight(color.color) ? "text-black/75" : "text-white/75"}
									${isolate && "scale-[97%]"}
									${smoothColorChange && "transition-colors"}
								`}
							style={{ background: color.color }}
						>
							<div></div>
							<div className="flex group flex-col items-center w-full h-full justify-end space-y-8 hover:opacity-100 transition-all">
								{/* Trash Icon */}
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<div
												onClick={() => removeColor(color.index)}
												className="rounded-full cursor-pointer flex justify-center items-center overflow-visible group h-12 w-12 hover:bg-accent/25"
											>
												<Trash2 className="h-6 w-6 group-hover:opacity-100 opacity-0 transition-opacity overflow-visible" />
											</div>
										</TooltipTrigger>
										<TooltipContent sideOffset={-24} side="bottom">
											<p>remove color</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								{/* Copy Icon */}
								<TooltipProvider>
									<Tooltip delayDuration={500}>
										<TooltipTrigger asChild>
											<div
												onClick={() => {
													navigator.clipboard.writeText(
														color.color
															.split("")
															.filter((letter: string) => letter != "#")
															.join("")
													);
													toast.success("Copied to clipboard!");
												}}
												className="rounded-full cursor-pointer flex justify-center items-center overflow-visible group h-12 w-12 hover:bg-accent/25"
											>
												<Copy className="h-6 w-6 group-hover:opacity-100 opacity-0 transition-opacity overflow-visible" />
											</div>
										</TooltipTrigger>
										<TooltipContent sideOffset={-24} side="bottom">
											<p>copy hex</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								{/* Lock Icon */}
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<div
												onClick={() => handleLock(color.color)}
												className="rounded-full cursor-pointer flex justify-center items-center overflow-visible group h-12 w-12 hover:bg-accent/25"
											>
												{color.locked ? (
													<Lock className="h-6 w-6 scale-125 cursor-pointer" />
												) : (
													<Unlock className="h-6 w-6 group-hover:opacity-100 opacity-0 transition-opacity overflow-visible" />
												)}
											</div>
										</TooltipTrigger>
										<TooltipContent sideOffset={-24} side="bottom">
											{color.locked ? <p>unlock color</p> : <p>lock color</p>}
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>

							<div className="space-y-4 select-none items-end">
								<DropdownMenu>
									<DropdownMenuTrigger
										asChild
										className={`text-2xl cursor-pointer hover:bg-accent/10 py-1 font-semibold uppercase w-[7ch] rounded-md text-center ${
											isLight(color.color)
												? "hover:bg-black/10"
												: "hover:bg-black/25"
										}`}
									>
										<p>
											{color.color
												.split("")
												.filter((letter: string) => letter != "#")
												.join("")}
										</p>
									</DropdownMenuTrigger>
									<DropdownMenuContent className="p-4 rounded-lg space-y-2">
										<HexColorPicker
											color={color.color}
											id="colorPicker"
											className="custom-layout"
											onChange={(newColor) => {
												let buffer = palette.map((paletteColor) => {
													if (paletteColor.index == color.index) {
														return {
															color: newColor,
															locked: paletteColor.locked,
															index: paletteColor.index,
														};
													}
													return paletteColor;
												});
												setPalette(buffer);
											}}
										/>
										<div>
											<HexColorInput
												prefixed
												color={color.color}
												onChange={(newColor) => {
													let buffer = palette.map((paletteColor) => {
														if (paletteColor.index == color.index) {
															return {
																color: newColor,
																locked: paletteColor.locked,
																index: paletteColor.index,
															};
														}
														return paletteColor;
													});
													setPalette(buffer);
												}}
												alpha={false}
												className="max-w-[9ch] uppercase border border-border p-1 px-2 rounded-md"
											/>
										</div>
										<div className="w-4 h-4 bg-blue"></div>
									</DropdownMenuContent>
								</DropdownMenu>

								{/* TODO: add variants for secondary display 
								(name, rgb, hsl, cmyk) */}
								<DialogTrigger asChild>
									<p className="capitalize cursor-pointer font-medium text-sm text-wrap text-center opacity-75 max-w-[12ch] mx-auto max-h-5">
										{secondary == "name" && GetColorName(color.color)}
										{secondary == "rgb" && hexToRGB(color.color)}
										{secondary == "hsl" && hexToHSL(color.color)}
										{secondary == "cmyk" && hexToCMYK(color.color)}
										{secondary == "lab" && hexToLAB(color.color)}
									</p>
								</DialogTrigger>
							</div>
						</div>
					))}
				</div>
			</Dialog>
		</div>
	);
};

export default Home;

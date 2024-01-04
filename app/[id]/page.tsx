"use client";

// TODO: add popup to have user accept cookies (react-cookie)
// TODO: add isolate and smooth color transition settings to cookies
// TODO: add drag and drop functionality to reorder colors (maybe use react-beautiful-dnd)

// FIXED: fix bug where re-render causes colors to unlock (shallow routing fix or alternative?) (fixed with history.replaceState)
// FIXED: cant have both transitions at the same time
// DONE: add a color picker to change colors when hex is clicked
// DONE: add isolate colors and smooth color transition

import { Button } from "@/components/ui/button";
import { Copy, Lock, MoreHorizontal, Plus, Trash2, Unlock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { GetColorName } from "hex-color-to-color-name";
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

import ColorPicker from "react-pick-color";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Home = () => {
	// store the palette in state
	const [palette, setPalette] = useState<any[]>([]);

	const [isolate, setIsolate] = useState<boolean>(false);
	const [smoothColorChange, setSmoothColorChange] = useState<boolean>(false);

	// get the palette from the url
	const { id } = useParams();
	// get the router (removed for now, replaced with history.replaceState)
	// const router = useRouter();

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

	// create a function to validate a set of hex colors separated by dashes, returns an array of valid hexes. If input is "new" returns an array of 5 random hexes
	const validateHexSet = (hex: any) => {
		if (hex == "generate") {
			let buffer = [
				{ color: randomColor(), locked: false, index: 0 },
				{ color: randomColor(), locked: false, index: 1 },
				{ color: randomColor(), locked: false, index: 2 },
				{ color: randomColor(), locked: false, index: 3 },
				{ color: randomColor(), locked: false, index: 4 },
			];

			// router.push(hexSetToUrl(buffer));
			history.replaceState(null, "", hexSetToUrl(buffer));

			return buffer;
		}

		const hexes = hex.split("-");
		// console.log(hexes);

		let buffer: any[] = [];
		let bufferCounter: number = 0;

		console.log("buffercounter", bufferCounter);

		hexes.map((hex: any) => {
			if (hex.length !== 6) {
				// console.log(`Hex must be 6 characters long`);
				return null;
			}
			if (isValidHexNoHash(hex) == false) {
				// console.log(`Hex '${hex}' is invalid`);
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
	const addColor = (index?: any) => {
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

	// validate the palette on page load and when the url changes and add event listener to randomizeButton
	useEffect(() => {
		setPalette(validateHexSet(id));

		// add event listener to randomizeButton
		document.addEventListener("keydown", keyDownHandler);
		return () => {
			document.removeEventListener("keydown", keyDownHandler);
		};
	}, []);

	useEffect(() => {
		// router.push(hexSetToUrl(palette));
		history.replaceState(null, "", hexSetToUrl(palette));
		// console.log(palette);
	}, [palette]);

	return (
		<div className="grid grid-rows-[auto_auto_1fr] min-h-screen grid-flow-row">
			<Dialog>
				<div className="h-14 row px-4 flex justify-end gap-4 items-center border-b"></div>
				<div className="h-14 row px-4 flex justify-between gap-4 items-center border-b">
					<p className="min-w-fit text-muted-foreground">
						Press the spacebar to generate a color palette!
					</p>
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
								<p>Isolate colors</p>
								<Checkbox
									className="scale-125"
									checked={isolate}
									onClick={() => setIsolate(!isolate)}
								/>
							</div>
							<div className=" text-muted-foreground font-medium flex justify-between items-center">
								<p>Smooth color transition</p>
								<Checkbox
									className="scale-125"
									checked={smoothColorChange}
									onClick={() => setSmoothColorChange(!smoothColorChange)}
								/>
							</div>
						</DialogContent>

						<div className="bg-border w-[1px] rounded-full" />
						<Button asChild onClick={() => addColor}>
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

				<div id="colors" className="grid grid-flow-col">
					{palette.map((color) => (
						<>
							<div
								key={color.index}
								className={`flex justify-end pb-20 flex-col space-y-8 items-center ${
									isLight(color.color) ? "text-black/75" : "text-white/75"
								}
						

						${isolate && "scale-[97%]"}
						${smoothColorChange && "transition-colors"}
						`}
								style={{ background: color.color }}
							>
								<div></div>
								<div className="flex flex-col items-center w-full h-full justify-end opacity-0 space-y-8 hover:opacity-100 transition-all">
									{/* Trash Icon */}
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger>
												<Button
													asChild
													className="rounded-full overflow-visible"
													variant={"ghost"}
													size={"icon"}
													onClick={() => removeColor(color.index)}
												>
													<Trash2 className="h-10 w-10 p-2 cursor-pointer" />
												</Button>
											</TooltipTrigger>
											<TooltipContent sideOffset={-24} side="bottom">
												<p>remove color</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>

									{/* Copy Icon */}
									<TooltipProvider>
										<Tooltip delayDuration={500}>
											<TooltipTrigger>
												<Button
													asChild
													className="rounded-full overflow-visible"
													onClick={() => {
														navigator.clipboard.writeText(color.color);
														toast.success("Copied to clipboard!");
													}}
													variant={"ghost"}
													size={"icon"}
												>
													<Copy className="h-10 w-10 p-2 cursor-pointer" />
												</Button>
											</TooltipTrigger>
											<TooltipContent sideOffset={-24} side="bottom">
												<p>copy hex</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>

									{/* Lock Icon */}
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger>
												<Button
													asChild
													onClick={() => handleLock(color.color)}
													variant={"ghost"}
													size={"icon"}
													className="rounded-full overflow-visible"
												>
													{color.locked ? (
														<Lock className="h-10 w-10 p-2 cursor-pointer" />
													) : (
														<Unlock className="h-10 w-10 p-2 cursor-pointer" />
													)}
												</Button>
											</TooltipTrigger>
											<TooltipContent sideOffset={-24} side="bottom">
												{color.locked ? <p>unlock color</p> : <p>lock color</p>}
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>
								<div className="space-y-4 items-end">
									<DropdownMenu>
										<DropdownMenuTrigger
											asChild
											className={`text-3xl cursor-pointer hover:bg-accent/10 py-1 font-semibold uppercase w-[7ch] rounded-md text-center ${
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
										<DropdownMenuContent className="p-0 rounded-lg">
											<ColorPicker
												color={color.color}
												onChange={(newColor) => {
													let buffer = palette.map((paletteColor) => {
														if (paletteColor.index == color.index) {
															return {
																color: newColor.hex,
																locked: paletteColor.locked,
																index: paletteColor.index,
															};
														}
														return paletteColor;
													});
													setPalette(buffer);
												}}
												className="p-2"
												theme={{
													background: "white",
													inputBackground: "white",
													borderColor: "lightgrey",
													borderRadius: "8px",
													color: "black",
												}}
												hideAlpha
											/>
										</DropdownMenuContent>
									</DropdownMenu>

									{/* TODO: add variants for secondary display 
								(name, rgb, hsl, cmyk) */}
									<DialogTrigger asChild>
										<p className="capitalize cursor-pointer font-medium text-nowrap text-center opacity-75">
											{GetColorName(color.color)}
										</p>
									</DialogTrigger>
								</div>
							</div>
						</>
					))}
				</div>
			</Dialog>
		</div>
	);
};

export default Home;
